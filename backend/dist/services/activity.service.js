import { logger } from '../utils/logger';
export class ActivityService {
    logPrismaDisabled(method) {
        logger.warn(`ActivityService.${method} called while Prisma is disabled.`);
    }
    // Faculty: Get their own activities only
    async getFacultyActivities(facultyId) {
        this.logPrismaDisabled('getFacultyActivities');
        logger.info(`Returning empty activities for faculty ${facultyId}`);
        return [];
    }
    // Verification Team: Get all pending activities
    async getPendingActivities(departmentId) {
        this.logPrismaDisabled('getPendingActivities');
        logger.info(`Returning empty pending activities${departmentId ? ` for department ${departmentId}` : ''}`);
        return [];
    }
    // HOD/Dean: Get department/college activities
    async getDepartmentActivities(departmentId, academicYear) {
        this.logPrismaDisabled('getDepartmentActivities');
        logger.info(`Returning empty department activities${departmentId ? ` for department ${departmentId}` : ''}${academicYear ? ` in ${academicYear}` : ''}`);
        return [];
    }
    // Submit new activity (Faculty)
    async submitActivity(facultyId, data) {
        this.logPrismaDisabled('submitActivity');
        return {
            id: 0,
            facultyId,
            activityTypeId: data.activityTypeId,
            title: data.title,
            description: data.description,
            activityDate: data.activityDate,
            proofDocumentPath: data.proofDocumentPath ?? null,
            additionalData: data.additionalData ?? null,
            status: 'pending',
            message: 'Activity persistence is disabled because Prisma is not in use.',
        };
    }
    // Approve activity (Verification Team)
    async approveActivity(activityId, verifiedBy, pointsEarned) {
        this.logPrismaDisabled('approveActivity');
        return {
            id: activityId,
            status: 'approved',
            verifiedBy,
            verifiedAt: new Date(),
            pointsEarned,
            message: 'Approval persistence is disabled because Prisma is not in use.',
        };
    }
    // Reject activity (Verification Team)
    async rejectActivity(activityId, verifiedBy, rejectionReason) {
        this.logPrismaDisabled('rejectActivity');
        return {
            id: activityId,
            status: 'rejected',
            verifiedBy,
            verifiedAt: new Date(),
            rejectionReason,
            message: 'Rejection persistence is disabled because Prisma is not in use.',
        };
    }
    // Get activity statistics
    async getActivityStats(departmentId, academicYear) {
        this.logPrismaDisabled('getActivityStats');
        logger.info(`Returning zeroed activity stats${departmentId ? ` for department ${departmentId}` : ''}${academicYear ? ` in ${academicYear}` : ''}`);
        return {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            totalPoints: 0,
        };
    }
}
export default new ActivityService();
