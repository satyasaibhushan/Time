public enum ConvexAPI {
    public enum Users {
        public static let current = "users:current"
        public static let ensureCurrent = "users:ensureCurrentUser"
    }

    public enum TimeEntries {
        public static let listActive = "timeEntries:listActiveTimers"
        public static let listRecent = "timeEntries:listRecent"
        public static let listByDateRange = "timeEntries:listByDateRange"
        public static let start = "timeEntries:startTimer"
        public static let pause = "timeEntries:pauseTimer"
        public static let resume = "timeEntries:resumeTimer"
        public static let stop = "timeEntries:stopTimer"
        public static let discard = "timeEntries:discardTimer"
        public static let createManual = "timeEntries:createManualEntry"
    }

    public enum Folders {
        public static let listAll = "folders:listAllFolders"
        public static let create = "folders:createFolder"
    }

    public enum Labels {
        public static let list = "labels:listLabels"
        public static let create = "labels:createLabel"
    }
}
