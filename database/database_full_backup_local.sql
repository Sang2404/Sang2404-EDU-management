--
-- PostgreSQL database dump
--

\restrict XJvmP2p01ATjmQnlRLpNtY9I9F19QAFzPPfsXCv8qK93ikt59uFEg5RQb9hZudR

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: grade_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.grade_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED'
);


ALTER TYPE public.grade_status OWNER TO postgres;

--
-- Name: request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.request_status OWNER TO postgres;

--
-- Name: request_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_type AS ENUM (
    'REVIEW',
    'RESERVE',
    'RETAKE'
);


ALTER TYPE public.request_type OWNER TO postgres;

--
-- Name: student_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.student_status AS ENUM (
    'STUDYING',
    'RESERVED',
    'GRADUATED',
    'DROPPED'
);


ALTER TYPE public.student_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'LECTURER',
    'STUDENT'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: academic_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.academic_requests (
    request_id integer NOT NULL,
    student_id character varying(20),
    request_type public.request_type NOT NULL,
    reason text NOT NULL,
    status public.request_status DEFAULT 'PENDING'::public.request_status,
    admin_response text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    grade_id integer
);


ALTER TABLE public.academic_requests OWNER TO postgres;

--
-- Name: academic_requests_request_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.academic_requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.academic_requests_request_id_seq OWNER TO postgres;

--
-- Name: academic_requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academic_requests_request_id_seq OWNED BY public.academic_requests.request_id;


--
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classes (
    class_id character varying(20) NOT NULL,
    major_id character varying(20),
    advisor_id character varying(20),
    class_name character varying(100),
    enrollment_year integer
);


ALTER TABLE public.classes OWNER TO postgres;

--
-- Name: course_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_sections (
    section_id integer NOT NULL,
    subject_id character varying(20),
    lecturer_id character varying(20),
    semester character varying(10) NOT NULL,
    academic_year character varying(9) NOT NULL,
    room_default character varying(50),
    max_capacity integer DEFAULT 60,
    section_code character varying(50) NOT NULL,
    is_locked boolean DEFAULT false
);


ALTER TABLE public.course_sections OWNER TO postgres;

--
-- Name: course_sections_section_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_sections_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_sections_section_id_seq OWNER TO postgres;

--
-- Name: course_sections_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_sections_section_id_seq OWNED BY public.course_sections.section_id;


--
-- Name: faculties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculties (
    faculty_id character varying(10) NOT NULL,
    faculty_name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.faculties OWNER TO postgres;

--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    grade_id integer NOT NULL,
    section_id integer,
    student_id character varying(20),
    attendance numeric(4,2),
    midterm numeric(4,2),
    final numeric(4,2),
    total_10 numeric(4,2),
    total_4 numeric(4,2),
    grade_char character varying(2),
    status public.grade_status DEFAULT 'DRAFT'::public.grade_status,
    CONSTRAINT grades_attendance_check CHECK (((attendance >= (0)::numeric) AND (attendance <= (10)::numeric))),
    CONSTRAINT grades_final_check CHECK (((final >= (0)::numeric) AND (final <= (10)::numeric))),
    CONSTRAINT grades_midterm_check CHECK (((midterm >= (0)::numeric) AND (midterm <= (10)::numeric)))
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades_grade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grades_grade_id_seq OWNER TO postgres;

--
-- Name: grades_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_grade_id_seq OWNED BY public.grades.grade_id;


--
-- Name: lecturers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lecturers (
    lecturer_id character varying(20) NOT NULL,
    user_id integer,
    faculty_id character varying(10),
    degree character varying(50),
    phone character varying(15)
);


ALTER TABLE public.lecturers OWNER TO postgres;

--
-- Name: majors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.majors (
    major_id character varying(20) NOT NULL,
    faculty_id character varying(10),
    major_name character varying(100) NOT NULL,
    total_credits integer DEFAULT 150
);


ALTER TABLE public.majors OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer,
    title character varying(200),
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedules (
    schedule_id integer NOT NULL,
    section_id integer,
    day_of_week integer,
    start_period integer,
    end_period integer,
    room character varying(50),
    CONSTRAINT schedules_day_of_week_check CHECK (((day_of_week >= 2) AND (day_of_week <= 8))),
    CONSTRAINT schedules_end_period_check CHECK (((end_period >= 1) AND (end_period <= 15))),
    CONSTRAINT schedules_start_period_check CHECK (((start_period >= 1) AND (start_period <= 15)))
);


ALTER TABLE public.schedules OWNER TO postgres;

--
-- Name: schedules_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schedules_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedules_schedule_id_seq OWNER TO postgres;

--
-- Name: schedules_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schedules_schedule_id_seq OWNED BY public.schedules.schedule_id;


--
-- Name: section_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_students (
    section_id integer NOT NULL,
    student_id character varying(20) NOT NULL,
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.section_students OWNER TO postgres;

--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    student_id character varying(20) NOT NULL,
    user_id integer,
    class_id character varying(20),
    dob date,
    gender character varying(10),
    phone character varying(15),
    address text,
    gpa_accumulated numeric(4,2) DEFAULT 0.0,
    status public.student_status DEFAULT 'STUDYING'::public.student_status
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: subject_prerequisites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_prerequisites (
    subject_id character varying(20) NOT NULL,
    prerequisite_id character varying(20) NOT NULL
);


ALTER TABLE public.subject_prerequisites OWNER TO postgres;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    subject_id character varying(20) NOT NULL,
    subject_name character varying(100) NOT NULL,
    credits integer NOT NULL,
    description text,
    CONSTRAINT subjects_credits_check CHECK ((credits > 0))
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(100) NOT NULL,
    username character varying(50),
    role public.user_role NOT NULL,
    full_name character varying(100) NOT NULL,
    avatar_url text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: academic_requests request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_requests ALTER COLUMN request_id SET DEFAULT nextval('public.academic_requests_request_id_seq'::regclass);


--
-- Name: course_sections section_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections ALTER COLUMN section_id SET DEFAULT nextval('public.course_sections_section_id_seq'::regclass);


--
-- Name: grades grade_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN grade_id SET DEFAULT nextval('public.grades_grade_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: schedules schedule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules ALTER COLUMN schedule_id SET DEFAULT nextval('public.schedules_schedule_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: academic_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (class_id, major_id, advisor_id, class_name, enrollment_year) FROM stdin;
D22HT01	7480201	GV001	ĐH CNTT K14 - Lớp 01	2022
\.


--
-- Data for Name: course_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) FROM stdin;
\.


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculties (faculty_id, faculty_name, description) FROM stdin;
IET	Viện Kỹ thuật - Công nghệ	\N
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) FROM stdin;
\.


--
-- Data for Name: lecturers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lecturers (lecturer_id, user_id, faculty_id, degree, phone) FROM stdin;
GV001	2	IET	Thạc sĩ	0987654321
GV005	27	\N	\N	\N
GV002	28	\N	\N	\N
GV003	29	\N	\N	\N
GV004	30	\N	\N	\N
\.


--
-- Data for Name: majors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.majors (major_id, faculty_id, major_name, total_credits) FROM stdin;
7480201	IET	Công nghệ thông tin	150
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, user_id, title, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) FROM stdin;
\.


--
-- Data for Name: section_students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section_students (section_id, student_id, registered_at) FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (student_id, user_id, class_id, dob, gender, phone, address, gpa_accumulated, status) FROM stdin;
2224802010365	3	D22HT01	2004-01-01	Nam	\N	\N	0.00	STUDYING
12333333333333333333	5	\N	\N	\N	\N	\N	0.00	STUDYING
20240001	7	\N	\N	\N	\N	\N	0.00	STUDYING
20240002	8	\N	\N	\N	\N	\N	0.00	STUDYING
20240003	9	\N	\N	\N	\N	\N	0.00	STUDYING
20240004	10	\N	\N	\N	\N	\N	0.00	STUDYING
20240005	11	\N	\N	\N	\N	\N	0.00	STUDYING
20240006	12	\N	\N	\N	\N	\N	0.00	STUDYING
20240007	13	\N	\N	\N	\N	\N	0.00	STUDYING
20240008	14	\N	\N	\N	\N	\N	0.00	STUDYING
20240009	15	\N	\N	\N	\N	\N	0.00	STUDYING
20240010	16	\N	\N	\N	\N	\N	0.00	STUDYING
20240011	17	\N	\N	\N	\N	\N	0.00	STUDYING
20240012	18	\N	\N	\N	\N	\N	0.00	STUDYING
20240013	19	\N	\N	\N	\N	\N	0.00	STUDYING
20240014	20	\N	\N	\N	\N	\N	0.00	STUDYING
20240015	21	\N	\N	\N	\N	\N	0.00	STUDYING
20240016	22	\N	\N	\N	\N	\N	0.00	STUDYING
20240017	23	\N	\N	\N	\N	\N	0.00	STUDYING
20240018	24	\N	\N	\N	\N	\N	0.00	STUDYING
20240019	25	\N	\N	\N	\N	\N	0.00	STUDYING
20240020	26	\N	\N	\N	\N	\N	0.00	STUDYING
\.


--
-- Data for Name: subject_prerequisites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_prerequisites (subject_id, prerequisite_id) FROM stdin;
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (subject_id, subject_name, credits, description) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) FROM stdin;
1	skillsaanh@gmail.com	ADMIN01	ADMIN	Quản trị viên	\N	t	2026-02-09 16:45:36.484626
2	sinfour503@gmail.com	GV001	LECTURER	Nguyễn Văn A	\N	t	2026-02-09 16:45:36.484626
3	2224802010365@student.tdmu.edu.vn	2224802010365	STUDENT	Nguyễn Văn B	\N	t	2026-02-09 16:45:36.484626
4	skillsanh@gmail.com	ADMIN02	ADMIN	Quản trị viên 2	\N	t	2026-02-09 16:59:08.709293
5	skillsadsaaaaaaanh@gmail.com	12333333333333333333	STUDENT	kiên	\N	t	2026-02-09 17:14:40.624925
6	2224802010902@student.tdmu.edu.vn	ADMIN03	ADMIN	Đặng Đình Trung	\N	t	2026-02-11 00:42:02.670032
7	sv001@university.edu.vn	20240001	STUDENT	Nguyễn Văn An	\N	t	2026-02-11 20:13:09.753919
8	sv002@university.edu.vn	20240002	STUDENT	Trần Thị Bích	\N	t	2026-02-11 20:13:09.78345
9	sv003@university.edu.vn	20240003	STUDENT	Lê Hoàng Nam	\N	t	2026-02-11 20:13:09.798743
10	sv004@university.edu.vn	20240004	STUDENT	Phạm Minh Tuấn	\N	t	2026-02-11 20:13:09.807555
11	sv005@university.edu.vn	20240005	STUDENT	Hoàng Thị Lan	\N	t	2026-02-11 20:13:09.813201
12	sv006@university.edu.vn	20240006	STUDENT	Đỗ Quang Huy	\N	t	2026-02-11 20:13:09.818773
13	sv007@university.edu.vn	20240007	STUDENT	Võ Thanh Tùng	\N	t	2026-02-11 20:13:09.824345
14	sv008@university.edu.vn	20240008	STUDENT	Nguyễn Thị Mai	\N	t	2026-02-11 20:13:09.830656
15	sv009@university.edu.vn	20240009	STUDENT	Bùi Đức Anh	\N	t	2026-02-11 20:13:09.836184
16	sv010@university.edu.vn	20240010	STUDENT	Phan Ngọc Hân	\N	t	2026-02-11 20:13:09.842389
17	sv011@university.edu.vn	20240011	STUDENT	Lý Quốc Bảo	\N	t	2026-02-11 20:13:09.847543
18	sv012@university.edu.vn	20240012	STUDENT	Trương Mỹ Linh	\N	t	2026-02-11 20:13:09.851399
19	sv013@university.edu.vn	20240013	STUDENT	Nguyễn Hải Đăng	\N	t	2026-02-11 20:13:09.856699
20	sv014@university.edu.vn	20240014	STUDENT	Đặng Thị Thu	\N	t	2026-02-11 20:13:09.859037
21	sv015@university.edu.vn	20240015	STUDENT	Huỳnh Gia Hưng	\N	t	2026-02-11 20:13:09.863877
22	sv016@university.edu.vn	20240016	STUDENT	Phạm Thảo Vy	\N	t	2026-02-11 20:13:09.868985
23	sv017@university.edu.vn	20240017	STUDENT	Ngô Minh Khoa	\N	t	2026-02-11 20:13:09.874709
24	sv018@university.edu.vn	20240018	STUDENT	Trần Gia Bảo	\N	t	2026-02-11 20:13:09.880287
25	sv019@university.edu.vn	20240019	STUDENT	Nguyễn Khánh Linh	\N	t	2026-02-11 20:13:09.884444
26	sv020@university.edu.vn	20240020	STUDENT	Phạm Quốc Thịnh	\N	t	2026-02-11 20:13:09.887859
27	gv001@university.edu.vn	GV005	LECTURER	TS. Nguyễn Văn Bình	\N	t	2026-02-11 20:13:09.891814
28	gv002@university.edu.vn	GV002	LECTURER	ThS. Trần Thị Hương	\N	t	2026-02-11 20:13:09.897517
29	gv003@university.edu.vn	GV003	LECTURER	TS. Lê Quang Vinh	\N	t	2026-02-11 20:13:09.900997
30	gv004@university.edu.vn	GV004	LECTURER	ThS. Phạm Thu Hà	\N	t	2026-02-11 20:13:09.904238
\.


--
-- Name: academic_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academic_requests_request_id_seq', 1, false);


--
-- Name: course_sections_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_sections_section_id_seq', 1, false);


--
-- Name: grades_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_grade_id_seq', 1, false);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 1, false);


--
-- Name: schedules_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedules_schedule_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 30, true);


--
-- Name: academic_requests academic_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_requests
    ADD CONSTRAINT academic_requests_pkey PRIMARY KEY (request_id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (class_id);


--
-- Name: course_sections course_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections
    ADD CONSTRAINT course_sections_pkey PRIMARY KEY (section_id);


--
-- Name: course_sections course_sections_section_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections
    ADD CONSTRAINT course_sections_section_code_key UNIQUE (section_code);


--
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (faculty_id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (grade_id);


--
-- Name: lecturers lecturers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_pkey PRIMARY KEY (lecturer_id);


--
-- Name: lecturers lecturers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_user_id_key UNIQUE (user_id);


--
-- Name: majors majors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT majors_pkey PRIMARY KEY (major_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (schedule_id);


--
-- Name: section_students section_students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_students
    ADD CONSTRAINT section_students_pkey PRIMARY KEY (section_id, student_id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- Name: subject_prerequisites subject_prerequisites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_pkey PRIMARY KEY (subject_id, prerequisite_id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- Name: grades unique_student_grade; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT unique_student_grade UNIQUE (section_id, student_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_academic_requests_grade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_academic_requests_grade ON public.academic_requests USING btree (grade_id);


--
-- Name: idx_academic_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_academic_requests_status ON public.academic_requests USING btree (status);


--
-- Name: idx_academic_requests_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_academic_requests_student ON public.academic_requests USING btree (student_id);


--
-- Name: academic_requests academic_requests_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_requests
    ADD CONSTRAINT academic_requests_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(grade_id) ON DELETE SET NULL;


--
-- Name: academic_requests academic_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_requests
    ADD CONSTRAINT academic_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: classes classes_advisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_advisor_id_fkey FOREIGN KEY (advisor_id) REFERENCES public.lecturers(lecturer_id);


--
-- Name: classes classes_major_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_major_id_fkey FOREIGN KEY (major_id) REFERENCES public.majors(major_id);


--
-- Name: course_sections course_sections_lecturer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections
    ADD CONSTRAINT course_sections_lecturer_id_fkey FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(lecturer_id);


--
-- Name: course_sections course_sections_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections
    ADD CONSTRAINT course_sections_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- Name: grades grades_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.course_sections(section_id);


--
-- Name: grades grades_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- Name: lecturers lecturers_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(faculty_id);


--
-- Name: lecturers lecturers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: majors majors_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT majors_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(faculty_id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: schedules schedules_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.course_sections(section_id) ON DELETE CASCADE;


--
-- Name: section_students section_students_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_students
    ADD CONSTRAINT section_students_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.course_sections(section_id) ON DELETE CASCADE;


--
-- Name: section_students section_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_students
    ADD CONSTRAINT section_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE;


--
-- Name: students students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: subject_prerequisites subject_prerequisites_prerequisite_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_prerequisite_id_fkey FOREIGN KEY (prerequisite_id) REFERENCES public.subjects(subject_id);


--
-- Name: subject_prerequisites subject_prerequisites_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict XJvmP2p01ATjmQnlRLpNtY9I9F19QAFzPPfsXCv8qK93ikt59uFEg5RQb9hZudR

