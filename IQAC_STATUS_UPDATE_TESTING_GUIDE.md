# IQAC Status Update Testing Guide

## Summary of Fixes Applied

### 1. Service Interface Updates ✅
Fixed all four service interfaces to use correct ENUM values:
- **Old**: `'initiated' | 'processing' | 'completed'`
- **New**: `'initiated' | 'approved' | 'rejected'`

Updated files:
- `/backend/src/services/studentPaperPresentation.service.ts`
- `/backend/src/services/studentProjectCompetition.service.ts`
- `/backend/src/services/studentTechnicalBodyMembership.service.ts`
- `/backend/src/services/studentNonTechnical.service.ts`

### 2. Route Validation Enhancements ✅
Added strict validation and debug logging to all four endpoints:
- Check if `iqacVerification` is defined
- Check if `iqacVerification` is a string
- Check if value is one of: `'initiated'`, `'approved'`, `'rejected'`
- Log all request details for debugging

Updated files:
- `/backend/src/routes/studentPaperPresentation.routes.ts`
- `/backend/src/routes/studentProjectCompetition.routes.ts`
- `/backend/src/routes/studentTechnicalBodyMembership.routes.ts`
- `/backend/src/routes/studentNonTechnical.routes.ts`

## Testing Instructions

### Test Endpoint: Update Paper Presentation IQAC Status
```bash
curl -X PUT http://localhost:5000/api/student-paper-presentations/1/iqac-status \
  -H "Content-Type: application/json" \
  -d '{
    "iqacVerification": "approved",
    "iqacRejectionRemarks": ""
  }'
```

### Test Endpoint: Update Project Competition IQAC Status
```bash
curl -X PUT http://localhost:5000/api/student-project-competitions/1/iqac-status \
  -H "Content-Type: application/json" \
  -d '{
    "iqacVerification": "rejected",
    "iqacRejectionRemarks": "Missing required documentation"
  }'
```

### Test Endpoint: Update Technical Body Membership IQAC Status
```bash
curl -X PUT http://localhost:5000/api/student-technical-body-memberships/1/iqac-status \
  -H "Content-Type: application/json" \
  -d '{
    "iqacVerification": "approved",
    "iqacRejectionRemarks": ""
  }'
```

### Test Endpoint: Update Non-Technical IQAC Status
```bash
curl -X PUT http://localhost:5000/api/student-non-technical/1/iqac-status \
  -H "Content-Type: application/json" \
  -d '{
    "iqacVerification": "initiated",
    "iqacRejectionRemarks": ""
  }'
```

## Expected Responses

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "IQAC status updated successfully",
  "iqacVerification": "approved"
}
```

### Validation Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid IQAC verification status. Must be one of: initiated, approved, rejected",
  "received": "invalid_value"
}
```

## Debug Logging

When you make requests, check the backend console logs for:

### PPR Logs:
```
DEBUG PPR iqac-status endpoint - Request body: { 
  iqacVerification: 'approved', 
  iqacRejectionRemarks: '',
  fullBody: {...}
}
```

### PCR Logs:
```
DEBUG PCR iqac-status endpoint - Request body: { 
  iqacVerification: 'rejected', 
  iqacRejectionRemarks: 'reason',
  fullBody: {...}
}
```

### TBM Logs:
```
DEBUG TBM iqac-status endpoint - Request body: { 
  iqacVerification: 'approved', 
  iqacRejectionRemarks: '',
  fullBody: {...}
}
```

### NT Logs:
```
DEBUG NT iqac-status endpoint - Request body: { 
  iqacVerification: 'initiated', 
  iqacRejectionRemarks: '',
  fullBody: {...}
}
```

## If Still Getting Error

1. **Check the debug logs** - Look at what `iqacVerification` value is actually being received
2. **Verify field name** - Make sure you're sending `iqacVerification` (camelCase), not `iqac_verification` (snake_case)
3. **Check spelling** - Ensure you're using exactly: `approved`, `rejected`, or `initiated` (no extra spaces)
4. **Check data type** - Make sure it's a string, not a number or boolean

## API Endpoints Summary

| Form | Endpoint | Method |
|------|----------|--------|
| Paper Presentation (PPR) | `/api/student-paper-presentations/:id/iqac-status` | PUT |
| Project Competition (PCR) | `/api/student-project-competitions/:id/iqac-status` | PUT |
| Technical Body Membership (TBM) | `/api/student-technical-body-memberships/:id/iqac-status` | PUT |
| Non-Technical (NT) | `/api/student-non-technical/:id/iqac-status` | PUT |

## Request Body Schema

```typescript
{
  "iqacVerification": "initiated" | "approved" | "rejected",  // REQUIRED
  "iqacRejectionRemarks": "Optional reason if status is rejected"  // OPTIONAL
}
```

## All Valid Transitions

1. **'initiated'** → No email sent, status shows "UNDER REVIEW"
2. **'approved'** → Email sent to student with "APPROVED" message
3. **'rejected'** → Email sent to student with "REJECTED" message and rejection remarks

## Verified Changes

✅ Service interfaces updated with correct ENUM values
✅ All four route validations use same logic
✅ Debug logging added to identify any issues
✅ Error messages now show received value for debugging
✅ Email notification system ready for all three statuses
