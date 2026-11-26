-- Dữ liệu ban đầu, lấy từ CV và PRD của Hoang Bao Han. Chạy sau schema.sql.

insert into public.profile (id, full_name, title, about, email, phone, location, github_url)
values (1, 'Hoang Bao Han', 'Industrial Management Student',
$$Third-year Industrial Management student at Ho Chi Minh City University of Technology and Engineering (GPA 3.82/4.0), with A+ results in Production Management, Production Planning and Scheduling and Quality Management. Experienced in data collection and analysis, technical reporting and presenting to juries, with MS Office proficiency (MOS Excel & Word, 1000/1000). Takes initiative and follows through with discipline, from securing corporate partners for a competition to sustaining a scholarship for four consecutive semesters.$$,
'baohanqt@gmail.com', '0837234109', 'Ho Chi Minh City, Vietnam', 'https://github.com/Hannah-2010');

insert into public.education (institution, major, level, duration, gpa, honors, coursework, sort_order) values
('Ho Chi Minh City University of Technology and Engineering', 'Industrial Management', 'Third-Year Student', 'Expected graduation: Dec 2027', '3.82/4.0',
 'Academic Scholarship for 4/4 consecutive semesters (Highest GPA in K24 Cohort)',
 'Production Management (A+), Quality Management (A+), Production Planning and Scheduling (A+)', 1);

insert into public.experiences (organization, role, period, description, sort_order) values
('Greenovation Challenge Competition 2025', 'Team Leader – GREENSOUL Ecoplant Project', 'Jun 2025 – Oct 2025',
 E'Directed project execution, applied analytical problem-solving to optimize material composition, and successfully steered the team to achieve the Top 12 position nationwide.\nManaged task delegation and guided the team in preparing technical reports and documentation, and delivering presentations to pitch the innovative business model to the jury.', 1),
('Eureka Student Scientific Research Award – 27th & 28th Edition', 'Lead Student Researcher in Economics and Engineering & Technology', 'Oct 2025 & Oct 2026',
 'Led research activities across two fields, Economics and Engineering & Technology, and advanced to the Semifinal Round, demonstrating strong research coordination and analytical skills.', 2),
('BECUTE Club (Faculty of Economics, HCMUTE)', 'Head of External Relations', 'Aug 2025 – Aug 2026',
 E'Led the external relations strategy and managed a team for the “Be Speaker” competition, demonstrating strong project management and leadership skills.\nNegotiated and successfully secured partnerships with corporate business leaders to serve as guest judges, a significant structural improvement from previous years’ reliance on internal lecturers.', 3),
('Virtual Student Exchange Program: HCMUTE & Batangas State University', 'Group Leader – Technopreneurship Program', 'Sep 2025 – Jan 2026',
 'Directed project planning and execution, delivering a comprehensive final project report that successfully achieved the highest score in the class.', 4);

insert into public.certificates (name, issuer, description, featured, sort_order) values
('Microsoft Office Specialist (MOS) 2019 – Excel', 'Microsoft', 'Perfect Score 1000/1000', true, 1),
('Microsoft Office Specialist (MOS) 2019 – Word', 'Microsoft', 'Perfect Score 1000/1000', true, 2),
('Gemini Certified Student', 'Google AI', '', false, 3),
('Academic Scholarship – 4/4 consecutive semesters', 'HCMUTE', 'Highest GPA in K24 Cohort', true, 4),
('Greenovation Challenge 2025 – Top 12 Nationwide', '', 'Team Leader – GREENSOUL Ecoplant Project', true, 5),
('Eureka Student Scientific Research Award – Semifinal Round', '', '27th & 28th Edition', false, 6);

insert into public.skills (category, name, sort_order) values
('Languages','English (Fluent)',1),('Languages','Japanese (Basic)',2),('Languages','Chinese (Basic)',3),
('Technical Tools','MS Office (Word, Excel, PowerPoint)',1),('Technical Tools','Power BI',2),('Technical Tools','Python (Basic)',3),('Technical Tools','FlexSim (Process Simulation)',4),
('Soft Skills','Initiative',1),('Soft Skills','Discipline',2),('Soft Skills','Data Accuracy',3),('Soft Skills','Presentation',4),('Soft Skills','Learning Agility',5);

insert into public.folders (name, sort_order) values
('01. CV & Personal Profile',1),('02. Academic Records',2),('03. Certificates',3),('04. Projects',4),('05. Experience',5),('06. Research',6);
