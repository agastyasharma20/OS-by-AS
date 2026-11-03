# OS by AS — Detailed Requirements

Reference spec for every module, kept verbatim from the original master prompt (sections 5–14).
The roadmap cites these as "Req §N". Read only the sections the current phase needs.

---

# 5. AUTHENTICATION AND LOGIN REQUIREMENTS

Implement the exact login model below.

## 5.1 Student Login

Students use their institutional ID.

Example:

PIEMR2026CS001

The student authentication experience must support:

- Student ID + Password.
- Student ID + Passkey.
- Device-supported biometric passkey authentication.
- New-device verification.
- Device trust management.
- Login alerts.
- Session management.

The student ID is an identifier, not a secret.

Do not use a student's name as their account identifier.

## 5.2 Faculty and Staff Login

Faculty and staff use their registered institutional username or name-based account identifier and password.

Every account must have a unique internal account ID.

Support these roles:

- Faculty.
- Faculty Coordinator.
- HOD.
- Director.
- Principal.
- Management.
- Placement Head.
- Training Head.
- Sports Head.
- Examination Head.
- Accounts Head.
- HR Head.
- Admission Head.
- Institutional Security Administrator.
- System Administrator.
- Platform Super Administrator.

## 5.3 Device Trust

Create a Device Trust Management System.

When a user logs in from a new device:

1. Detect that the device is unrecognized.
2. Require additional authentication.
3. Verify using an approved MFA or passkey method.
4. Register the device after successful verification.
5. Notify the user about the new login.
6. Record the event in the audit log.

Provide a security dashboard where users can:

- View registered devices.
- View login history.
- Revoke a device.
- Revoke active sessions.
- Log out from all devices.
- Report suspicious activity.

Device trust must be revocable and must not permanently bypass authentication.

Do not rely exclusively on browser fingerprinting.

## 5.4 Privileged Account Security

HOD, Director, Management, Examination Head, Placement Head, Training Head, Accounts Head and other privileged accounts must have stronger authentication.

Support:

- Microsoft Authenticator.
- TOTP.
- WebAuthn.
- FIDO2 security keys.
- Passkeys.
- Step-up authentication.
- New-device verification.
- Login notifications.
- Session revocation.
- Risk-based access controls.

Implement a configurable 14-day password rotation policy for designated privileged accounts, as required by the institution.

Also implement:

- Password history.
- Compromised-password screening.
- Password expiry reminders.
- Secure recovery.
- Session invalidation after credential changes where appropriate.

Make password rotation configurable. Passkey-only accounts must not be forced into password rotation.

Biometric authentication must use the device's secure authentication system. Do not store raw facial or fingerprint templates centrally.

---

# 6. AUTHORIZATION AND SECURITY REQUIREMENTS

Use centralized RBAC + ABAC.

Every backend endpoint must validate:

- User identity.
- Account status.
- Role.
- Permission.
- Institution.
- Campus.
- Department.
- Resource ownership.
- Workflow state.
- Field-level permissions.
- Deadline.
- Allowed operation.

Implement protection against:

- Broken Access Control.
- IDOR.
- BOLA.
- Privilege escalation.
- Mass assignment.
- SQL injection.
- XSS.
- CSRF.
- SSRF.
- Authentication bypass.
- Session theft.
- Replay attacks where relevant.
- Insecure file access.
- Cross-tenant data access.

The frontend is not a security boundary.

Do not rely on:
- Hidden buttons.
- Disabled controls.
- JavaScript restrictions.
- Right-click blocking.
- Browser console blocking.
- Obfuscation.
- Client-side timestamps.

---

# 7. INSTITUTION CONFIGURATION STUDIO

Build a visual configuration system.

Institutions must be able to configure:

- Institution name.
- Branding.
- Campuses.
- Departments.
- Programs.
- Academic years.
- Semesters.
- Academic calendars.
- Working days.
- Subjects.
- Curriculum.
- Syllabus.
- Units.
- Topics.
- Learning outcomes.
- Course credits.
- Faculty assignments.
- Assessment patterns.
- Grading rules.
- Attendance rules.
- Examination policies.
- Timetable rules.
- Roles.
- Permissions.
- Approval workflows.
- Notifications.
- Documents.
- Reports.
- Data retention.
- Localization.

Use the hierarchy:

Institution → Campus → Department → Program → Academic Year → Semester → Subject → Unit → Topic → Subtopic → Learning Outcome → Resource → Activity → Assessment.

Provide:

- Configuration versioning.
- Preview.
- Validation.
- Approval.
- Effective dates.
- Rollback.
- Impact analysis.
- Audit history.

Do not require code changes for ordinary institutional configuration.

---

# 8. COMPLETE FEATURE REQUIREMENTS

## 8.1 OS Institutional

Build:

- Admission CRM.
- Enquiries.
- Applications.
- Eligibility.
- Merit lists.
- Counselling.
- Enrollment.
- Student profiles.
- Faculty profiles.
- Department management.
- Program management.
- Academic calendar.
- Timetable.
- Attendance.
- Leave.
- Faculty workload.
- Substitution.
- Announcements.
- Communication.
- Grievances.
- Document management.

## 8.2 OS Academics

Build:

- Course registration.
- Subject allocation.
- Academic planning.
- Faculty teaching plans.
- Topic coverage.
- Assignments.
- Internal assessments.
- Practical assessments.
- Attendance.
- Course outcomes.
- Program outcomes.
- Learning-outcome mapping.
- Student progress tracking.

## 8.3 OS LMS

Build:

- Course pages.
- Learning materials.
- Notes.
- Slides.
- PDFs.
- Recorded lectures.
- Assignments.
- Quizzes.
- Discussions.
- Announcements.
- Progress tracking.
- Resource analytics.
- Course completion.

## 8.4 OS AI Content Studio

Generate:

- Detailed notes.
- Short notes.
- Lecture plans.
- Slide decks.
- Scripts.
- Revision materials.
- Glossaries.
- Examples.
- Case studies.
- Infographics.
- Mind maps.
- Concept maps.
- Flowcharts.
- Architecture diagrams.
- ER diagrams.
- UML diagrams.
- Assignments.
- MCQs.
- Question banks.
- Practical exercises.
- Labs.
- Viva questions.
- Rubrics.
- Project ideas.

Support AI-generated curriculum structures and uploaded document conversion.

All generated content must be editable and reviewable.

AI must not fabricate references.

## 8.5 OS AI Campus

Provide role-specific assistants for:

- Students.
- Faculty.
- HOD.
- Director.
- Management.
- Placement team.
- Examination team.

Use permission-aware retrieval. The AI must never access or reveal data beyond the user's authorization.

## 8.6 CHAKRAVYUH AI

Build:

- Question paper creation.
- Question banks.
- Difficulty classification.
- Bloom taxonomy.
- Course outcome mapping.
- Paper moderation.
- COE approval.
- Examination calendar.
- Seating plans.
- Hall tickets.
- QR/barcode answer-book identification.
- Secure scanning.
- OCR.
- Handwriting recognition.
- Question segmentation.
- Rubric-based evaluation.
- Partial marks.
- Confidence scoring.
- Faculty review.
- Result approval.
- Revaluation.
- SGPA and CGPA.
- Examination analytics.

AI marks must remain provisional until authorized human approval.

Preserve original answer sheets and all evaluation versions.

## 8.7 OS Virtual Labs

Build:

- Python Lab.
- DBMS Lab.
- Linux Lab.
- TOC Lab.
- DSA Lab.
- Web Development Lab.
- AI Lab.
- Engineering-specific labs.
- Browser-based editors.
- Code execution.
- Hidden tests.
- Lab records.
- PDF generation.
- Faculty monitoring.

Student code must run in isolated sandboxes with CPU, memory, time and network restrictions.

Never run untrusted student code on the main application server.

## 8.8 ProjectOS

Build:

- Project proposals.
- Team management.
- Mentor allocation.
- Milestones.
- Task boards.
- Gantt charts.
- GitHub integration.
- Meeting trackers.
- Reports.
- Documentation.
- Research.
- Publications.
- Patent/IP records.
- Demonstrations.
- Evaluation rubrics.
- Viva.
- Final project submission.

Support configurable mentor meeting frequencies.

Meeting records may include date, time, mentor, topics, progress, blockers, next actions and supporting evidence.

## 8.9 SkillVerse

Build multidisciplinary skill learning for:

- Computer Science.
- IT.
- AI/ML.
- Electronics.
- Electrical.
- Mechanical.
- Civil.
- Architecture.
- IoT.
- Robotics.
- Management.
- Commerce.
- Pharmacy.
- Sciences.
- Other institution-configured disciplines.

Include learning paths, resources, practical tasks, assessments, projects and certifications.

## 8.10 CodeArena

Build:

- DSA learning.
- Topic explanations.
- Visualizations.
- Dry runs.
- Complexity analysis.
- Practice questions.
- Coding challenges.
- Compiler.
- Test cases.
- Hidden tests.
- Debugging.
- Code submissions.
- Leaderboards.
- Contests.
- AI Code Mentor.

## 8.11 CareerForge

Build:

- Placement CRM.
- Recruiter database.
- Job opportunities.
- Internship opportunities.
- Eligibility rules.
- Applications.
- Placement drives.
- Interview schedules.
- Results.
- Offers.
- Resume Studio.
- Job-description matching.
- Skill-gap analysis.
- AI Interview Studio.
- Placement analytics.

Never fabricate student skills, qualifications or experience.

## 8.12 SpeakUp

Build:

- Daily speaking challenges.
- One-minute video challenges.
- Technical speaking practice.
- Group discussion simulations.
- Interview speaking practice.
- Transcription.
- Grammar feedback.
- Vocabulary feedback.
- Structure feedback.
- Clarity feedback.
- Pace feedback.
- Filler-word analysis.

## 8.13 CampusConnect

Build:

- Event creation.
- Dedicated event webpages.
- Custom event templates.
- Shareable URLs.
- Registration.
- Team registration.
- Eligibility.
- Capacity management.
- Waitlists.
- QR passes.
- Entry scanning.
- Attendance.
- Volunteer management.
- Sponsorship.
- Budgeting.
- Certificates.
- Event analytics.
- Festival management.
- AI Event Copilot.

Each event must have a dedicated public or institution-restricted webpage according to its visibility settings.

## 8.14 ClubOS

Build:

- Club creation.
- Club objectives.
- Constitution.
- Faculty coordinator.
- HOD approval.
- President and committee.
- Club recruitment.
- Membership.
- Committee positions.
- Event proposals.
- Budget.
- Expenses.
- Sponsorship.
- Inventory.
- Meetings.
- Annual plans.
- Elections.
- Reports.
- Handover.
- Club performance analytics.

Use hierarchical permissions and approval workflows.

## 8.15 OS Stars

Build:

- Unified Stars.
- Achievement badges.
- Streaks.
- Leagues.
- Leaderboards.
- Challenges.
- Team challenges.
- Academic achievements.
- Projects.
- Events.
- Clubs.
- Hackathons.
- Sports.
- Communication.
- Certifications.
- Awards.

Implement transparent scoring and anti-fraud controls.

Do not award high-value points without appropriate verification.

## 8.16 OS Finance

Build:

- Fee structures.
- Installments.
- Payments.
- Receipts.
- Scholarships.
- Refunds.
- Expenses.
- Budgets.
- Vouchers.
- Ledgers.
- Reconciliation.
- Financial reports.

## 8.17 OS People

Build:

- HR.
- Recruitment.
- Employee lifecycle.
- Leave.
- Attendance.
- Payroll.
- Payslips.
- Appraisals.
- Faculty workload.
- Employee documents.

## 8.18 OS Campus Operations

Build:

- Library.
- Hostel.
- Transport.
- Sports.
- Canteen.
- Inventory.
- Procurement.
- Facilities.
- Maintenance.
- Vendor management.
- IT Helpdesk.

## 8.19 OS Accreditation

Build:

- CO/PO/PSO mapping.
- CO attainment.
- PO attainment.
- Evidence management.
- Course files.
- Academic audits.
- IQAC records.
- Accreditation reports.
- Configurable NAAC/NBA workflows.

## 8.20 OS Alumni

Build:

- Alumni directory.
- Mentorship.
- Alumni events.
- Guest lectures.
- Donations.
- Industry networking.
- Recruiter connections.
- Research collaboration.

---

# 9. ACADEMIC ACTIVITY ANALYTICS

Implement a privacy-aware learning activity tracking system.

Track meaningful interactions such as:

- Resource opened.
- Resource revisited.
- Pages viewed.
- Video progress.
- Download.
- Assignment started.
- Assignment submitted.
- Quiz started.
- Quiz completed.
- Learning activity completion.
- Last access.
- Active interaction indicators.

Provide dashboards for:

- Faculty.
- HOD.
- Director.
- Authorized management.

Example:

Student opens Unit 1 notes 8 times, with 52 minutes of recorded active interaction.

Do not treat browser-tab duration as proof of learning.

Keep learning engagement separate from assessment performance.

Use purpose limitation, data retention controls and role-based visibility.

---

# 10. SECURITY AND INTEGRITY REQUIREMENTS

## 10.1 Academic Integrity

Students must not be able to manipulate:

- Assignment dates.
- Submission timestamps.
- Quiz timers.
- Marks.
- Attendance.
- CGPA.
- Results.
- Completion status.
- User roles.

All authoritative values must be controlled by the backend.

## 10.2 Assignment Security

- Server timestamps.
- Server-controlled deadlines.
- Attempt limits.
- Submission receipts.
- File hashes.
- Version history.
- Late-submission rules.
- Authorized correction workflow.

## 10.3 Quiz Security

- Server-controlled timing.
- Attempt limits.
- Randomization.
- Server-side scoring.
- Attempt locking.
- Secure receipts.
- Audit history.

## 10.4 Marks Security

- Authorized entry.
- Review.
- Approval.
- Locking.
- Amendment workflow.
- Old and new values.
- Reason.
- Actor.
- Timestamp.

## 10.5 File Upload Security

- Allowlisted file types.
- Signature validation.
- Malware scanning.
- Quarantine.
- Private object storage.
- Short-lived download URLs.
- Access control.
- Audit logs.

## 10.6 AI Security

Implement:

- AI Gateway.
- Prompt-injection defenses.
- Permission-aware RAG.
- Tenant isolation.
- Sensitive-data filtering.
- AI output review.
- Model and prompt versioning.
- Usage monitoring.
- Cost controls.
- Rate limits.
- Human approval for sensitive decisions.

Treat uploaded documents and retrieved content as untrusted input.

## 10.7 Security Monitoring

Monitor:

- Login failures.
- MFA failures.
- New devices.
- Privilege changes.
- Sensitive exports.
- Unusual downloads.
- Marks changes.
- Attendance corrections.
- Examination access.
- Suspicious API requests.

Support alerting, investigation, session revocation and incident workflows.

---

# 11. UI/UX DESIGN REQUIREMENTS

Build a premium, professional, modern enterprise interface.

The interface should be:

- Clean.
- Consistent.
- Responsive.
- Accessible.
- Fast.
- Role-specific.
- Easy to navigate.
- Suitable for large institutional datasets.

Create:

- Public landing page.
- Login pages.
- Student dashboard.
- Faculty dashboard.
- HOD dashboard.
- Director dashboard.
- Management dashboard.
- Examination workspace.
- Placement workspace.
- Club workspace.
- Event workspace.
- Configuration Studio.
- Security Center.
- Admin Center.

Use a unified design system.

Include:

- Sidebar navigation.
- Role-aware menus.
- Breadcrumbs.
- Search.
- Notifications.
- Profile menu.
- Data tables.
- Filters.
- Pagination.
- Dialogs.
- Forms.
- Empty states.
- Loading states.
- Error states.
- Responsive navigation.

Do not create separate unrelated visual systems for each module.

---

# 12. DATABASE DESIGN REQUIREMENTS

Create a normalized, maintainable PostgreSQL schema.

Core domains should include:

- Tenants.
- Institutions.
- Campuses.
- Departments.
- Programs.
- Academic years.
- Semesters.
- Subjects.
- Curriculum.
- Topics.
- Users.
- Roles.
- Permissions.
- User-role assignments.
- Student profiles.
- Faculty profiles.
- Guardians.
- Enrollments.
- Timetables.
- Attendance.
- Assignments.
- Submissions.
- Quizzes.
- Questions.
- Assessments.
- Marks.
- Results.
- Learning resources.
- Learning activity events.
- Events.
- Registrations.
- Clubs.
- Club memberships.
- Projects.
- Mentors.
- Meetings.
- Stars.
- Achievements.
- Recruiters.
- Jobs.
- Applications.
- Payments.
- Fees.
- Employees.
- Payroll.
- Documents.
- Notifications.
- Devices.
- Sessions.
- Audit events.
- AI generations.
- Workflow definitions.
- Workflow instances.
- Approvals.

Requirements:

- Proper foreign keys.
- Unique constraints.
- Indexes.
- Transactions.
- Soft deletion where appropriate.
- Versioning for critical records.
- Tenant isolation.
- Database migrations.
- Seed data.

Do not create one giant table for all modules.

---

# 13. API DESIGN

Build documented APIs.

Requirements:

- RESTful design.
- FastAPI OpenAPI documentation.
- Versioned endpoints.
- Request validation.
- Response schemas.
- Authentication.
- Authorization.
- Rate limiting.
- Pagination.
- Filtering.
- Sorting.
- Error handling.
- Idempotency for transactional endpoints.
- Audit logging.

Never expose internal database entities without proper authorization and serialization.

---

# 14. TESTING REQUIREMENTS

Every phase must include appropriate tests.

## Unit Tests

- Business logic.
- Validation.
- Permissions.
- Calculations.
- Workflow transitions.

## Integration Tests

- API.
- Database.
- Authentication.
- Authorization.
- Notifications.
- File storage.
- AI gateway.

## Security Tests

- IDOR.
- BOLA.
- Privilege escalation.
- Cross-tenant access.
- SQL injection.
- XSS.
- CSRF.
- Session handling.
- Rate limits.
- Unauthorized file access.

## End-to-End Tests

Test complete workflows.

Examples:

- Student logs in and submits an assignment.
- Faculty evaluates the assignment.
- HOD reviews a department report.
- COE creates and approves an examination.
- Student registers for an event.
- Organizer scans a QR pass.
- Club President proposes an event.
- Faculty Coordinator approves it.
- HOD reviews club performance.

---
