/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-02-15
 * @last modified by  : woomg@dkbmc.com
**/
public without sharing class UserAdminController {

    @AuraEnabled
    public static Boolean checkSystemAdmin(){

        Boolean isSysAdmin = false;

        try {
            if (!Schema.sObjectType.Profile.fields.Name.isCreateable()) {
                throw new AuraHandledException('Not permitted');
            }
            
            String profileName = [SELECT Name FROM Profile WHERE Id = :UserInfo.getprofileId()].Name;

            if(profileName == 'System Admin' || profileName == 'System Administrator'){
                isSysAdmin = true;
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return isSysAdmin;
    }

    @AuraEnabled
    public static map<String, Integer> retrieveLicense(){
        map<String, Integer> mapLicense = new  map<String, Integer>();
        try {
            if (!Schema.sObjectType.UserLicense.fields.TotalLicenses.isAccessible()) {
                throw new AuraHandledException('Not permitted');
            }
            UserLicense ul = [SELECT TotalLicenses, UsedLicenses FROM UserLicense WHERE Name = 'Salesforce'];
            mapLicense.put('total', Integer.valueOf(ul.TotalLicenses));
            mapLicense.put('used', Integer.valueOf(ul.UsedLicenses));

            mapLicense = getUserLicenseByDivision(mapLicense);

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return mapLicense;
    }

    @TestVisible
    private static map<String, Integer> getUserLicenseByDivision(map<String, Integer> ml){
        if (!Schema.sObjectType.User.fields.Division.isAccessible()) {
            throw new AuraHandledException('Not permitted');
        }

        list<AggregateResult> lar = [SELECT COUNT(Id) CNT,
                                        Division Division
                                     FROM User
                                     WHERE Profile.UserLicense.Name = 'Salesforce'
                                        AND IsActive = TRUE
                                     GROUP BY Division
                                     ORDER BY Division ASC];
        if(!lar.isEmpty()){
            for(AggregateResult ar : lar){
                String division = ar.get('Division') != null ? (String) ar.get('Division') : 'EMPTY';
                Integer cnt = (Integer) ar.get('CNT');

                ml.put(division, cnt);
            }
        }

        return ml;
    }

    @AuraEnabled
    public static list<UserAdminController.Role> retrieveRoles(){
        list<UserAdminController.Role> lrole = new list<UserAdminController.Role>();
        try {
            if (!Schema.sObjectType.UserRole.fields.Name.isAccessible()) {
                throw new AuraHandledException('Not permitted');
            }
            
            list<UserRole> roles = [SELECT Id, Name, ParentRoleId FROM UserRole ORDER BY Name ASC];
            if(!roles.isEmpty()){
                for(UserRole role : roles){
                    UserAdminController.Role crole = new UserAdminController.Role(role.Name, role.Id, role.ParentRoleId);
                    lrole.add(crole);
                }
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return lrole;
    }
    
    @AuraEnabled
    public static list<PermissionSet> retrieveProfile(){
        list<PermissionSet> lprofile = new list<PermissionSet>();
        try {
            if (!Schema.sObjectType.PermissionSet.fields.Label.isAccessible()) {
                throw new AuraHandledException('Not permitted');
            }
            
            lprofile = [SELECT ProfileId, Profile.Name 
                        FROM PermissionSet 
                        WHERE IsOwnedByProfile = true 
                            AND (IsCustom = true OR Profile.Name = 'System Administrator') 
                        ORDER BY Profile.Name];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return lprofile;
    }

    @AuraEnabled
    public static map<String, Object> retrieveUsers(String isActive, String profileId, list<String> roleIds, String searchText, Integer pageNum){
        map<String, Object> mapUser = new map<String, Object>();
        try {
            if (!Schema.sObjectType.User.fields.Name.isAccessible()) {
                throw new AuraHandledException('Not permitted');
            }
            String query = '';
            query += 'SELECT Id, Name, LastName, FirstName, Alias, Title, Profile.Name, UserRole.Name, ';
            query += ' IsActive, Username, Email, Division, Department, FederationIdentifier ';
            query += 'FROM User WHERE Profile.UserLicense.Name = \'Salesforce\' ';
            if(searchText != ''){
                searchText = searchText + '%';
                query += 'AND (LastName LIKE :searchText OR FirstName LIKE :searchText OR FederationIdentifier LIKE :searchText) ';
            }
            if(isActive == ''){
                query += 'AND IsActive = true ';
            }
            if(!roleIds.isEmpty()){
                query += 'AND UserRoleId IN :roleIds ';
            }
            if(profileId != 'All'){
                query += 'AND ProfileId = :profileId ';
            }
            query += 'ORDER BY Name ASC';
            system.debug(query);
            ApexPages.StandardSetController con = new ApexPages.StandardSetController(Database.getQueryLocator(query));
            con.setPageSize(50);
            con.setPageNumber(pageNum);
            Integer total = con.getResultSize();
            mapUser.put('data', con.getRecords());
            mapUser.put('total', total);
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return mapUser;
    }

    @AuraEnabled
    public static map<String, Object> retrieveLazyUsers(String searchText, String timeline, Boolean includeFrozen, Integer pageNum){
        map<String, Object> mapUser = new map<String, Object>();
        try {
            DateTime cutline;
            Date baseDate = system.today();
            Time baseTime = Time.newInstance(0, 0, 0, 0);

            if (!Schema.sObjectType.User.fields.Name.isAccessible()) {
                throw new AuraHandledException('Not permitted');
            }
            switch on timeline {
                when '7' {
                    cutline = DateTime.newInstance(baseDate.addDays(-7), baseTime);
                }
                when '30' {
                    cutline = DateTime.newInstance(baseDate.addDays(-30), baseTime);
                }
                when '60' {
                    cutline = DateTime.newInstance(baseDate.addDays(-60), baseTime);
                }
                when else {
                    cutline = DateTime.newInstance(baseDate.addDays(-7), baseTime);
                }
            }

            String query = '';
            query += 'SELECT Id, Name, LastName, FirstName, Profile.Name, UserRole.Name, IsActive, ';
            query += ' Username, Email, Division, Department, FederationIdentifier, LastLoginDate ';
            query += 'FROM User WHERE Profile.UserLicense.Name = \'Salesforce\' ';
            query += 'AND IsActive = true ';
            if(searchText != ''){
                searchText = searchText + '%';
                query += 'AND (LastName LIKE :searchText OR FirstName LIKE :searchText OR FederationIdentifier LIKE :searchText) ';
            }
            if(!includeFrozen){
                query += 'AND Id IN (SELECT UserId FROM UserLogin WHERE IsFrozen = false) ';
            }
            query += 'AND LastLoginDate <= :cutline ';
            query += 'ORDER BY Name ASC';
            system.debug(query);
            ApexPages.StandardSetController con = new ApexPages.StandardSetController(Database.getQueryLocator(query));
            con.setPageSize(50);
            con.setPageNumber(pageNum);
            Integer total = con.getResultSize();
            mapUser.put('data', makeCustomUsers(con.getRecords(), true));
            mapUser.put('total', total);
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return mapUser;
    }

    @AuraEnabled
    public static map<String, Object> retrieveFrozenUsers(String searchText, Integer pageNum){
        map<String, Object> mapUser = new map<String, Object>();
        try {
            if (!Schema.sObjectType.UserLogin.fields.IsFrozen.isUpdateable()) {
                throw new AuraHandledException('Not permitted');
            }

            String query = '';
            query += 'SELECT Id, Name, LastName, FirstName, Profile.Name, UserRole.Name, IsActive, ';
            query += ' Username, Email, Division, Department, FederationIdentifier, LastLoginDate ';
            query += 'FROM User WHERE Profile.UserLicense.Name = \'Salesforce\' ';
            query += 'AND IsActive = true ';
            if(searchText != ''){
                searchText = searchText + '%';
                query += 'AND (LastName LIKE :searchText OR FirstName LIKE :searchText OR FederationIdentifier LIKE :searchText) ';
            }
            query += 'AND Id IN (SELECT UserId FROM UserLogin WHERE IsFrozen = true) ';
            query += 'ORDER BY Name ASC';
            system.debug(query);
            ApexPages.StandardSetController con = new ApexPages.StandardSetController(Database.getQueryLocator(query));
            con.setPageSize(50);
            con.setPageNumber(pageNum);
            Integer total = con.getResultSize();
            mapUser.put('data', makeCustomUsers(con.getRecords(), true));
            mapUser.put('total', total);
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return mapUser;
    }

    @AuraEnabled
    public static Boolean makeUserDisabled(list<String> userIds, String mode){
        Boolean result = false;
        try {
            if(mode == 'freeze'){
                result = frozenHandler(userIds, true);
            } else {
                if (!Schema.sObjectType.User.fields.IsActive.isUpdateable()) {
                    throw new AuraHandledException('Not permitted');
                }
    
                list<User> usrs = [SELECT Id, IsActive FROM User WHERE Id IN : userIds];

                if(!usrs.isEmpty()){
                    for(User usr : usrs){
                        usr.IsActive = false;
                    }

                    update usrs;
                    result = true;
                    //system.debug('made inactive');
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return result;
    }

    @AuraEnabled
    public static Boolean frozenHandler(list<String> userIds, Boolean mode){
        Boolean result = false;
        try {

            if (!Schema.sObjectType.UserLogin.fields.IsFrozen.isUpdateable() || 
                !Schema.sObjectType.User.fields.FederationIdentifier.isUpdateable()) {
                throw new AuraHandledException('Not permitted');
            }

            list<UserLogin> lul = [SELECT Id, IsFrozen FROM UserLogin WHERE UserId IN :userIds];
            if(!lul.isEmpty()){
                for(UserLogin ul : lul){
                    ul.isFrozen = mode;
                }

                update lul;
            }
            list<User> lusr = [SELECT Id, FederationIdentifier FROM User WHERE Id IN :userIds];
            if(!lusr.isEmpty()){
                for(User usr : lusr){
                    String ssoId = usr.FederationIdentifier != null ? usr.FederationIdentifier : '';
                    if(mode){
                        ssoId = ssoId + '_freeze';
                    } else {
                        ssoId = ssoId.replaceAll('_freeze', '');
                    }
                    usr.FederationIdentifier = ssoId;
                }
                
                update lusr;
            }
            result = true;
            //system.debug('made freeze/unfreeze');
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return result;
    }

    @AuraEnabled
    public static Boolean resetPassword(list<String> userInfos, String mode, String newPassword){
        Boolean result = false;
        try {
            if(mode == 'manual'){
                for(String id : userInfos){
                    system.setPassword(id, newPassword);
                }
                result = true;
            } else {
                for(String username : userInfos){
                    Site.forgotPassword(username);
                }
                result = true;
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return result;
    }

    @AuraEnabled
    public static Boolean shutoutUser(String userId){
        Boolean result = false;
        try {
            if (!Schema.sObjectType.User.fields.IsActive.isUpdateable()) {
                throw new AuraHandledException('Not permitted');
            }
            User usr = [SELECT Id, Username, IsActive FROM User WHERE Id = :userId LIMIT 1];
            String username = usr.Username;
            list<String> names = username.split('@');
            String newname = names[0] + '.' + system.now().format('yyyyMMdd') + '@' + names[1];

            usr.Username = newname;
            usr.IsActive = false;

            update usr;
            result = true;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return result;
    }

    @TestVisible
    private static list<CustomUser> makeCustomUsers(list<User> usrs, Boolean isFrozen){
        list<CustomUser> lcu = new list<CustomUser>();
        set<String> setUL = makeMap4LoginUser(isFrozen);

        for(User usr : usrs){
            CustomUser cu = makeCustomUser(usr, setUL.contains(usr.Id));
            lcu.add(cu);
        }
        
        return lcu;
    }


    @TestVisible
    private static CustomUser makeCustomUser(User usr, Boolean isFrozen){

        CustomUser cu = new CustomUser();
        cu.id            = usr.Id;
        cu.Name          = usr.Name;
        cu.LastName      = usr.LastName;
        cu.FirstName     = usr.FirstName != null ? usr.FirstName : '';
        cu.ProfileName   = usr.Profile.Name != null ? usr.Profile.Name : '';
        cu.RoleName      = usr.UserRole.Name != null ? usr.UserRole.Name : '';
        cu.IsActive      = usr.IsActive;
        cu.Username      = usr.Username;
        cu.Email         = usr.Email;
        cu.Division      = usr.Division != null ? usr.Division : '';
        cu.Department    = usr.Department != null ? usr.Department : '';
        cu.SSOID         = usr.FederationIdentifier != null ? usr.FederationIdentifier : '';
        cu.LastLoginDate = usr.LastLoginDate != null ? usr.LastLoginDate.format('yyyy-MM-dd HH:mm') : '';
        cu.LastLogin     = usr.LastLoginDate != null ? Math.abs(system.today().daysBetween(usr.LastLoginDate.date())) : 0;
        cu.IsFrozen      = isFrozen;

        return cu;
    }
    
    @TestVisible
    private static set<String> makeMap4LoginUser(Boolean mode){
        set<String> setUL = new set<String>();
        list<UserLogin> lul = [SELECT UserId FROM UserLogin WHERE IsFrozen = :mode];

        if(!lul.isEmpty()){
            for(UserLogin ul : lul){
                setUL.add(ul.UserId);
            }
        }
        return setUL;
    }

    public class Role {
        @AuraEnabled
        public String   text        { get; set; }
        @AuraEnabled
        public String   id          { get; set; }
        @AuraEnabled
        public String   parentId    { get; set; }

        public Role(String text, String id, String parentId){
            this.text = text;
            this.id = id;
            this.parentId = parentId == null ? null : parentId;
        }
    }

    public class CustomUser {
        @AuraEnabled
        public String   id              { get; set; }
        @AuraEnabled
        public String   Name            { get; set; }
        @AuraEnabled
        public String   LastName        { get; set; }
        @AuraEnabled
        public String   FirstName       { get; set; }
        @AuraEnabled
        public String   ProfileName     { get; set; }
        @AuraEnabled
        public String   RoleName        { get; set; }
        @AuraEnabled
        public Boolean  IsActive        { get; set; }
        @AuraEnabled
        public String   Username        { get; set; }
        @AuraEnabled
        public String   Email           { get; set; }
        @AuraEnabled
        public String   Division        { get; set; }
        @AuraEnabled
        public String   Department      { get; set; }
        @AuraEnabled
        public String   SSOID           { get; set; }
        @AuraEnabled
        public String   LastLoginDate   { get; set; }
        @AuraEnabled
        public Integer  LastLogin       { get; set; }
        @AuraEnabled
        public Boolean  IsFrozen        { get; set; }
    }
}