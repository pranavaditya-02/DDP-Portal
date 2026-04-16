import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

interface PatentFiledFormData {
  preliminaryDataId?: number | null;
  claimedByFacultyId: string;
  claimedByFacultyName: string;
  patentContributionType: 'applicant' | 'inventor';
  taskId: string;
  yuktiRegistrationProofPath?: string;
  
  specialLabsInvolved: 'yes' | 'no';
  specialLabId?: number | null;
  specialLabName?: string;
  
  registrationDate: string;
  claimedByDepartmentId: number;
  claimedByDepartmentName: string;
  filedApplicationNumber: string;
  
  earlyPublicationForm9Filed: 'yes' | 'no';
  examinationForm18Filed: 'yes' | 'no';
  
  collaborationType: 'none' | 'other-institute-india' | 'industry' | 'foreign-institute';
  collaboratingOrganizationName?: string;
  
  bitNameIncludedInApplicant: 'yes' | 'no';
  patentLevel: 'national' | 'international';
  
  patentLicensed: 'yes' | 'no';
  patentLicenseDetails?: string;
  
  fundFromManagement: 'yes' | 'no';
  fundAmount?: number | null;
  apexProofPath?: string;
  
  sponsorshipFromAgency: 'yes' | 'no';
  fundingAgencyName?: string;
  
  patentCBRReceiptPath?: string;
  documentProofPath?: string;
  
  facultyMembers: Array<{
    number: number; // 1-6
    facultyId: string;
    facultyName: string;
    patentContribution: 'applicant' | 'inventor';
  }>;
  
  studentMembers: Array<{
    number: number; // 1-5
    studentName: string;
    patentContribution: 'applicant' | 'inventor';
  }>;
  
  createdBy?: string;
}

interface PatentFiledResponse {
  id: number;
  [key: string]: any;
}

class PatentFiledService {
  /**
   * Create a new patent filed record
   */
  async create(data: PatentFiledFormData): Promise<PatentFiledResponse> {
    const connection = await getMysqlPool().getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert main patent filed record
      const patentFiledQuery = `
        INSERT INTO patents_filed (
          preliminary_data_id,
          claimed_by_faculty_id,
          claimed_by_faculty_name,
          patent_contribution_type,
          task_id,
          yukti_registration_proof_path,
          special_labs_involved,
          special_lab_id,
          special_lab_name,
          registration_date,
          claimed_by_department_id,
          claimed_by_department_name,
          filed_application_number,
          early_publication_form9_filed,
          examination_form18_filed,
          collaboration_type,
          collaborating_organization_name,
          bit_name_included_in_applicant,
          patent_level,
          patent_licensed,
          patent_license_details,
          fund_from_management,
          fund_amount,
          apex_proof_path,
          sponsorship_from_agency,
          funding_agency_name,
          patent_cbr_receipt_path,
          document_proof_path,
          iqac_verification,
          iqac_remarks,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(patentFiledQuery, [
        data.preliminaryDataId || null,
        data.claimedByFacultyId,
        data.claimedByFacultyName,
        data.patentContributionType,
        data.taskId,
        data.yuktiRegistrationProofPath || null,
        data.specialLabsInvolved,
        data.specialLabId || null,
        data.specialLabName || null,
        data.registrationDate,
        data.claimedByDepartmentId,
        data.claimedByDepartmentName,
        data.filedApplicationNumber,
        data.earlyPublicationForm9Filed,
        data.examinationForm18Filed,
        data.collaborationType,
        data.collaboratingOrganizationName || null,
        data.bitNameIncludedInApplicant,
        data.patentLevel,
        data.patentLicensed,
        data.patentLicenseDetails || null,
        data.fundFromManagement,
        data.fundAmount || null,
        data.apexProofPath || null,
        data.sponsorshipFromAgency,
        data.fundingAgencyName || null,
        data.patentCBRReceiptPath || null,
        data.documentProofPath || null,
        'initiated',
        null,
        data.createdBy || null,
      ]);

      const patentFiledId = (result as any).insertId;

      // Insert faculty members
      if (data.facultyMembers && data.facultyMembers.length > 0) {
        const facultyQuery = `
          INSERT INTO patents_filed_faculty_members (
            patent_filed_id,
            faculty_member_number,
            faculty_id,
            faculty_name,
            patent_contribution
          ) VALUES (?, ?, ?, ?, ?)
        `;

        for (const faculty of data.facultyMembers) {
          await connection.execute(facultyQuery, [
            patentFiledId,
            faculty.number,
            faculty.facultyId,
            faculty.facultyName,
            faculty.patentContribution,
          ]);
        }
      }

      // Insert student members
      if (data.studentMembers && data.studentMembers.length > 0) {
        const studentQuery = `
          INSERT INTO patents_filed_student_members (
            patent_filed_id,
            student_member_number,
            student_name,
            patent_contribution
          ) VALUES (?, ?, ?, ?)
        `;

        for (const student of data.studentMembers) {
          await connection.execute(studentQuery, [
            patentFiledId,
            student.number,
            student.studentName,
            student.patentContribution,
          ]);
        }
      }

      await connection.commit();

      return {
        id: patentFiledId,
        success: true,
        message: 'Patent filed record created successfully',
      };
    } catch (error) {
      await connection.rollback();
      logger.error('Error creating patent filed record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get patent filed record by ID with faculty and student details
   */
  async getById(id: number): Promise<any> {
    const connection = await getMysqlPool().getConnection();

    try {
      const patentQuery = 'SELECT * FROM patents_filed WHERE id = ?';
      const [patentRows] = await connection.execute(patentQuery, [id]);

      if ((patentRows as any[]).length === 0) {
        return null;
      }

      const patent = (patentRows as any[])[0];

      // Get faculty members
      const facultyQuery = 'SELECT * FROM patents_filed_faculty_members WHERE patent_filed_id = ? ORDER BY faculty_member_number';
      const [facultyRows] = await connection.execute(facultyQuery, [id]);
      patent.facultyMembers = facultyRows;

      // Get student members
      const studentQuery = 'SELECT * FROM patents_filed_student_members WHERE patent_filed_id = ? ORDER BY student_member_number';
      const [studentRows] = await connection.execute(studentQuery, [id]);
      patent.studentMembers = studentRows;

      return patent;
    } catch (error) {
      logger.error('Error fetching patent filed record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * List patent filed records with pagination
   */
  async list(filters?: any, page: number = 1, pageSize: number = 10): Promise<{ records: any[]; total: number }> {
    const connection = await getMysqlPool().getConnection();

    try {
      let query = 'SELECT * FROM patents_filed WHERE 1=1';
      const params: any[] = [];

      if (filters?.claimedByFacultyId) {
        query += ' AND claimed_by_faculty_id = ?';
        params.push(filters.claimedByFacultyId);
      }

      if (filters?.claimedByDepartmentId) {
        query += ' AND claimed_by_department_id = ?';
        params.push(filters.claimedByDepartmentId);
      }

      if (filters?.iqacVerification) {
        query += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      // Get total count
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
      const [countResult] = await connection.execute(countQuery, params);
      const total = (countResult as any[])[0].count;

      // Get paginated results
      const offset = (page - 1) * pageSize;
      query += ` ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
      const [records] = await connection.execute(query, params);

      return { records: records as any[], total };
    } catch (error) {
      logger.error('Error listing patent filed records:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update patent filed record
   */
  async update(id: number, data: Partial<PatentFiledFormData>): Promise<void> {
    const connection = await getMysqlPool().getConnection();

    try {
      await connection.beginTransaction();

      // Build update query
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      if (data.preliminaryDataId !== undefined) {
        updateFields.push('preliminary_data_id = ?');
        updateParams.push(data.preliminaryDataId);
      }
      if (data.filedApplicationNumber !== undefined) {
        updateFields.push('filed_application_number = ?');
        updateParams.push(data.filedApplicationNumber);
      }
      if (data.patentLicensed !== undefined) {
        updateFields.push('patent_licensed = ?');
        updateParams.push(data.patentLicensed);
      }
      // Add more fields as needed...

      if (updateFields.length > 0) {
        updateParams.push(id);
        const updateQuery = `UPDATE patents_filed SET ${updateFields.join(', ')} WHERE id = ?`;
        await connection.execute(updateQuery, updateParams);
      }

      // Update faculty members if provided
      if (data.facultyMembers) {
        await connection.execute('DELETE FROM patents_filed_faculty_members WHERE patent_filed_id = ?', [id]);
        
        if (data.facultyMembers.length > 0) {
          const facultyQuery = `
            INSERT INTO patents_filed_faculty_members (
              patent_filed_id,
              faculty_member_number,
              faculty_id,
              faculty_name,
              patent_contribution
            ) VALUES (?, ?, ?, ?, ?)
          `;

          for (const faculty of data.facultyMembers) {
            await connection.execute(facultyQuery, [
              id,
              faculty.number,
              faculty.facultyId,
              faculty.facultyName,
              faculty.patentContribution,
            ]);
          }
        }
      }

      // Update student members if provided
      if (data.studentMembers) {
        await connection.execute('DELETE FROM patents_filed_student_members WHERE patent_filed_id = ?', [id]);
        
        if (data.studentMembers.length > 0) {
          const studentQuery = `
            INSERT INTO patents_filed_student_members (
              patent_filed_id,
              student_member_number,
              student_name,
              patent_contribution
            ) VALUES (?, ?, ?, ?)
          `;

          for (const student of data.studentMembers) {
            await connection.execute(studentQuery, [
              id,
              student.number,
              student.studentName,
              student.patentContribution,
            ]);
          }
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      logger.error('Error updating patent filed record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete patent filed record
   */
  async delete(id: number): Promise<void> {
    const connection = await getMysqlPool().getConnection();

    try {
      await connection.execute('DELETE FROM patents_filed WHERE id = ?', [id]);
    } catch (error) {
      logger.error('Error deleting patent filed record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new PatentFiledService();
