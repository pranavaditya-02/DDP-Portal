"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multer_1 = require("multer");
var fs_1 = require("fs");
var path_1 = require("path");
var mysql_1 = require("../database/mysql");
var logger_1 = require("../utils/logger");
var router = express_1.default.Router();
var uploadDir = path_1.default.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads', 'online-courses');
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
var generateFileUrl = function (filename) {
    var baseUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
        .replace(/\/$/, '')
        .replace(/\/api$/, '');
    return "".concat(baseUrl, "/uploads/online-courses/").concat(filename);
};
var storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) { return cb(null, uploadDir); },
    filename: function (_req, file, cb) {
        var uniqueSuffix = "".concat(Date.now(), "-").concat(Math.round(Math.random() * 1e9));
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
var fileFilter = function (_req, file, cb) {
    var allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF and image files (JPG, PNG) are allowed'));
    }
};
var upload = (0, multer_1.default)({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/student-online-courses', upload.fields([
    { name: 'originalProof', maxCount: 1 },
    { name: 'attendedProof', maxCount: 1 },
]), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, _a, student, yearOfStudy, specialLab, onlineCourse, courseType, marksAvailable, marksObtained, startDate, endDate, examDate, durationWeeks, partOfAcademic, semester, sponsorshipType, interdisciplinary, department, certificateUrl, iqacVerification, requiredFields, _i, requiredFields_1, field, originalProofFilename, attendedProofFilename, start, end, exam, hasMarks, isPartOfAcademic, isInterdisciplinary, result, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, mysql_1.getMysqlPool)().getConnection()];
            case 1:
                connection = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 6, 8, 9]);
                return [4 /*yield*/, connection.beginTransaction()];
            case 3:
                _b.sent();
                _a = req.body, student = _a.student, yearOfStudy = _a.yearOfStudy, specialLab = _a.specialLab, onlineCourse = _a.onlineCourse, courseType = _a.courseType, marksAvailable = _a.marksAvailable, marksObtained = _a.marksObtained, startDate = _a.startDate, endDate = _a.endDate, examDate = _a.examDate, durationWeeks = _a.durationWeeks, partOfAcademic = _a.partOfAcademic, semester = _a.semester, sponsorshipType = _a.sponsorshipType, interdisciplinary = _a.interdisciplinary, department = _a.department, certificateUrl = _a.certificateUrl, iqacVerification = _a.iqacVerification;
                requiredFields = [
                    'student',
                    'yearOfStudy',
                    'specialLab',
                    'onlineCourse',
                    'courseType',
                    'marksAvailable',
                    'startDate',
                    'endDate',
                    'examDate',
                    'durationWeeks',
                    'partOfAcademic',
                    'sponsorshipType',
                    'interdisciplinary',
                    'certificateUrl',
                    'iqacVerification',
                ];
                for (_i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
                    field = requiredFields_1[_i];
                    if (!req.body[field]) {
                        return [2 /*return*/, res.status(400).json({ error: "Missing required field: ".concat(field) })];
                    }
                }
                if (marksAvailable === 'Yes' && !marksObtained) {
                    return [2 /*return*/, res.status(400).json({ error: "Marks Obtained is required when Marks Available is 'Yes'" })];
                }
                if (partOfAcademic === 'Yes' && !semester) {
                    return [2 /*return*/, res.status(400).json({ error: "Semester is required when Part of Academic is 'Yes'" })];
                }
                if (interdisciplinary === 'Yes' && !department) {
                    return [2 /*return*/, res.status(400).json({ error: "Department is required when Interdisciplinary is 'Yes'" })];
                }
                if (!req.files || !('originalProof' in req.files) || !('attendedProof' in req.files)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Both Original Certificate Proof and Attended Certificate are required' })];
                }
                originalProofFilename = req.files.originalProof[0].filename;
                attendedProofFilename = req.files.attendedProof[0].filename;
                start = new Date(startDate);
                end = new Date(endDate);
                exam = new Date(examDate);
                if (start >= end) {
                    return [2 /*return*/, res.status(400).json({ error: 'Start Date must be before End Date' })];
                }
                if (exam < end) {
                    return [2 /*return*/, res.status(400).json({ error: 'Exam Date must be on or after End Date' })];
                }
                hasMarks = marksAvailable === 'Yes' ? 1 : 0;
                isPartOfAcademic = partOfAcademic === 'Yes' ? 1 : 0;
                isInterdisciplinary = interdisciplinary === 'Yes' ? 1 : 0;
                return [4 /*yield*/, connection.query("INSERT INTO student_online_courses (\n          student_id,\n          year_of_study,\n          special_lab_id,\n          online_course_id,\n          course_type,\n          marks_available,\n          percentage_obtained,\n          start_date,\n          end_date,\n          exam_date,\n          duration_weeks,\n          is_part_of_academic,\n          semester,\n          sponsorship_type,\n          interdisciplinary,\n          department,\n          original_certificate_file,\n          attested_certificate_file,\n          certificate_url,\n          iqac_status,\n          created_at,\n          updated_at\n        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())", [
                        student,
                        yearOfStudy,
                        specialLab || null,
                        onlineCourse,
                        courseType,
                        hasMarks,
                        marksObtained || null,
                        startDate,
                        endDate,
                        examDate,
                        durationWeeks,
                        isPartOfAcademic,
                        partOfAcademic === 'Yes' ? semester : null,
                        sponsorshipType,
                        isInterdisciplinary,
                        interdisciplinary === 'Yes' ? department : null,
                        originalProofFilename,
                        attendedProofFilename,
                        certificateUrl,
                        iqacVerification,
                    ])];
            case 4:
                result = (_b.sent())[0];
                return [4 /*yield*/, connection.commit()];
            case 5:
                _b.sent();
                res.status(201).json({
                    message: 'Online course record created successfully',
                    id: result.insertId,
                    data: {
                        id: result.insertId,
                        studentId: student,
                        courseId: onlineCourse,
                        courseType: courseType,
                        startDate: startDate,
                        endDate: endDate,
                        iqacStatus: iqacVerification,
                        originalProofUrl: generateFileUrl(originalProofFilename),
                        attendedProofUrl: generateFileUrl(attendedProofFilename),
                    },
                });
                return [3 /*break*/, 9];
            case 6:
                err_1 = _b.sent();
                return [4 /*yield*/, connection.rollback()];
            case 7:
                _b.sent();
                logger_1.logger.error('Error creating online course record:', err_1);
                res.status(500).json({ error: 'Failed to create online course record', details: err_1.message });
                return [3 /*break*/, 9];
            case 8:
                connection.release();
                return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); });
router.get('/student-online-courses', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var pool, rows, rowsWithUrls, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                pool = (0, mysql_1.getMysqlPool)();
                return [4 /*yield*/, pool.query("SELECT \n        soc.*, \n        s.student_name AS student_name, \n        oc.course_name, \n        sl.name AS lab_name, \n        d.dept_name \n       FROM student_online_courses soc \n       LEFT JOIN students s ON soc.student_id = s.id \n       LEFT JOIN online_courses oc ON soc.online_course_id = oc.id \n       LEFT JOIN special_labs sl ON soc.special_lab_id = sl.id \n       LEFT JOIN departments d ON soc.department = d.id \n       ORDER BY soc.created_at DESC")];
            case 1:
                rows = (_a.sent())[0];
                rowsWithUrls = rows.map(function (row) { return (__assign(__assign({}, row), { originalProofUrl: row.original_certificate_file ? generateFileUrl(row.original_certificate_file) : null, attendedProofUrl: row.attested_certificate_file ? generateFileUrl(row.attested_certificate_file) : null })); });
                res.json(rowsWithUrls);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                logger_1.logger.error('Error fetching online course records:', err_2);
                res.status(500).json({ error: 'Failed to fetch online course records', details: err_2.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
