--
-- PostgreSQL database dump
--

\restrict M0A0hpLhUbut0c1zr3qDVBsSpxhgZpsQphVcvr0froEOgX80zX5FijzNMlSxrg1

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-11 16:40:10

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
-- TOC entry 5 (class 2615 OID 16674)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 878 (class 1247 OID 16694)
-- Name: grade_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.grade_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED'
);


ALTER TYPE public.grade_status OWNER TO postgres;

--
-- TOC entry 884 (class 1247 OID 16710)
-- Name: request_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.request_status OWNER TO postgres;

--
-- TOC entry 881 (class 1247 OID 16702)
-- Name: request_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.request_type AS ENUM (
    'REVIEW',
    'RESERVE',
    'RETAKE'
);


ALTER TYPE public.request_type OWNER TO postgres;

--
-- TOC entry 875 (class 1247 OID 16684)
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
-- TOC entry 872 (class 1247 OID 16676)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'LECTURER',
    'STUDENT'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 239 (class 1255 OID 17866)
-- Name: check_lecturer_schedule_conflict(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_lecturer_schedule_conflict() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_lecturer_id VARCHAR(20);
    v_conflict_count INTEGER;
BEGIN
    -- Lấy lecturer_id từ section
    SELECT lecturer_id INTO v_lecturer_id
    FROM course_sections
    WHERE section_id = NEW.section_id;
    
    -- Kiểm tra xung đột với các lịch khác của cùng giảng viên
    SELECT COUNT(*) INTO v_conflict_count
    FROM schedules s
    JOIN course_sections cs ON s.section_id = cs.section_id
    WHERE cs.lecturer_id = v_lecturer_id
      AND s.schedule_id != COALESCE(NEW.schedule_id, -1)
      AND s.week = NEW.week
      AND s.day_of_week = NEW.day_of_week
      AND (
          (s.start_period <= NEW.start_period AND s.end_period > NEW.start_period) OR
          (s.start_period < NEW.end_period AND s.end_period >= NEW.end_period) OR
          (s.start_period >= NEW.start_period AND s.end_period <= NEW.end_period)
      );
    
    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Giảng viên đã có lịch dạy vào thời gian này (Tuần %, Thứ %, Tiết %-%)!', 
            NEW.week, NEW.day_of_week, NEW.start_period, NEW.end_period;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_lecturer_schedule_conflict() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 236 (class 1259 OID 16926)
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
-- TOC entry 235 (class 1259 OID 16925)
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
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 235
-- Name: academic_requests_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.academic_requests_request_id_seq OWNED BY public.academic_requests.request_id;


--
-- TOC entry 224 (class 1259 OID 16776)
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
-- TOC entry 229 (class 1259 OID 16843)
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
-- TOC entry 228 (class 1259 OID 16842)
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
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 228
-- Name: course_sections_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_sections_section_id_seq OWNED BY public.course_sections.section_id;


--
-- TOC entry 221 (class 1259 OID 16736)
-- Name: faculties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculties (
    faculty_id character varying(10) NOT NULL,
    faculty_name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.faculties OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16902)
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
-- TOC entry 233 (class 1259 OID 16901)
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
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 233
-- Name: grades_grade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_grade_id_seq OWNED BY public.grades.grade_id;


--
-- TOC entry 223 (class 1259 OID 16758)
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
-- TOC entry 222 (class 1259 OID 16745)
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
-- TOC entry 238 (class 1259 OID 16946)
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
-- TOC entry 237 (class 1259 OID 16945)
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
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 237
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- TOC entry 232 (class 1259 OID 16886)
-- Name: schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedules (
    schedule_id integer NOT NULL,
    section_id integer,
    day_of_week integer DEFAULT 2 NOT NULL,
    start_period integer,
    end_period integer,
    room character varying(50),
    week_number integer,
    week integer DEFAULT 1 NOT NULL,
    CONSTRAINT check_day_of_week CHECK (((day_of_week >= 2) AND (day_of_week <= 8))),
    CONSTRAINT check_week_number CHECK (((week_number >= 1) AND (week_number <= 16))),
    CONSTRAINT check_week_range CHECK (((week >= 1) AND (week <= 16))),
    CONSTRAINT schedules_end_period_check CHECK (((end_period >= 1) AND (end_period <= 15))),
    CONSTRAINT schedules_start_period_check CHECK (((start_period >= 1) AND (start_period <= 15)))
);


ALTER TABLE public.schedules OWNER TO postgres;

--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN schedules.day_of_week; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.schedules.day_of_week IS 'Thứ trong tuần (2=Thứ 2, ..., 7=Thứ 7, 8=Chủ nhật)';


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN schedules.week_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.schedules.week_number IS 'Tuần học trong học kỳ (1-16)';


--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN schedules.week; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.schedules.week IS 'Tuần học trong học kỳ (1-16)';


--
-- TOC entry 231 (class 1259 OID 16885)
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
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 231
-- Name: schedules_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schedules_schedule_id_seq OWNED BY public.schedules.schedule_id;


--
-- TOC entry 230 (class 1259 OID 16867)
-- Name: section_students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_students (
    section_id integer NOT NULL,
    student_id character varying(20) NOT NULL,
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.section_students OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16792)
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
-- TOC entry 227 (class 1259 OID 16825)
-- Name: subject_prerequisites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subject_prerequisites (
    subject_id character varying(20) NOT NULL,
    prerequisite_id character varying(20) NOT NULL
);


ALTER TABLE public.subject_prerequisites OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16814)
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
-- TOC entry 220 (class 1259 OID 16718)
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
-- TOC entry 219 (class 1259 OID 16717)
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
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4944 (class 2604 OID 17604)
-- Name: academic_requests request_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_requests ALTER COLUMN request_id SET DEFAULT nextval('public.academic_requests_request_id_seq'::regclass);


--
-- TOC entry 4935 (class 2604 OID 17605)
-- Name: course_sections section_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections ALTER COLUMN section_id SET DEFAULT nextval('public.course_sections_section_id_seq'::regclass);


--
-- TOC entry 4942 (class 2604 OID 17606)
-- Name: grades grade_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN grade_id SET DEFAULT nextval('public.grades_grade_id_seq'::regclass);


--
-- TOC entry 4948 (class 2604 OID 17607)
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 17608)
-- Name: schedules schedule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules ALTER COLUMN schedule_id SET DEFAULT nextval('public.schedules_schedule_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 17609)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5191 (class 0 OID 16926)
-- Dependencies: 236
-- Data for Name: academic_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) FROM stdin;
\.


--
-- TOC entry 5179 (class 0 OID 16776)
-- Dependencies: 224
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (class_id, major_id, advisor_id, class_name, enrollment_year) FROM stdin;
D22HT01	7480201	GV001	ĐH CNTT K14 - Lớp 01	2022
\.


--
-- TOC entry 5184 (class 0 OID 16843)
-- Dependencies: 229
-- Data for Name: course_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) FROM stdin;
29	TIN101	GV001	HK2	2025-2026	A101	60	TIN101-01	f
30	TIN102	GV001	HK2	2025-2026	A102	60	TIN102-01	f
31	TIN103	GV001	HK2	2025-2026	A103	60	TIN103-01	f
32	TIN104	GV001	HK2	2025-2026	A104	60	TIN104-01	f
33	TIN105	GV001	HK2	2025-2026	A105	60	TIN105-01	f
34	TIN106	GV001	HK2	2025-2026	A106	60	TIN106-01	f
35	TIN107	GV001	HK2	2025-2026	A107	60	TIN107-01	f
36	TIN108	GV001	HK2	2025-2026	A108	60	TIN108-01	f
37	TIN109	GV001	HK2	2025-2026	A109	60	TIN109-01	f
38	TIN110	GV001	HK2	2025-2026	A110	60	TIN110-01	f
39	TIN201	GV002	HK2	2025-2026	B201	60	TIN201-01	f
40	TIN202	GV002	HK2	2025-2026	B202	60	TIN202-01	f
41	TIN203	GV002	HK2	2025-2026	B203	60	TIN203-01	f
42	TIN204	GV002	HK2	2025-2026	B204	60	TIN204-01	f
43	TIN205	GV002	HK2	2025-2026	B205	60	TIN205-01	f
44	TIN206	GV002	HK2	2025-2026	B206	60	TIN206-01	f
45	TIN207	GV002	HK2	2025-2026	B207	60	TIN207-01	f
46	TIN208	GV002	HK2	2025-2026	B208	60	TIN208-01	f
47	TIN209	GV002	HK2	2025-2026	B209	60	TIN209-01	f
48	TIN210	GV002	HK2	2025-2026	B210	60	TIN210-01	f
50	CNTT01	GV001	HK3	2025-2026	\N	40	TESTCS101.01	f
\.


--
-- TOC entry 5176 (class 0 OID 16736)
-- Dependencies: 221
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculties (faculty_id, faculty_name, description) FROM stdin;
IET	Viện Kỹ thuật - Công nghệ	Đào tạo các ngành kỹ thuật
\.


--
-- TOC entry 5189 (class 0 OID 16902)
-- Dependencies: 234
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) FROM stdin;
66	29	2224802010365	9.50	8.50	9.00	8.90	3.70	\N	APPROVED
67	30	2224802010365	8.00	7.50	8.00	7.80	3.30	\N	APPROVED
68	31	2224802010365	9.00	9.50	9.00	9.10	4.00	\N	APPROVED
69	32	2224802010365	7.00	6.50	7.00	6.80	3.00	\N	APPROVED
70	33	2224802010365	8.50	8.00	8.50	8.30	3.50	\N	APPROVED
71	34	2224802010365	9.00	8.50	9.50	9.00	4.00	\N	APPROVED
72	35	2224802010365	7.50	7.00	7.50	7.30	3.00	\N	APPROVED
75	38	2224802010365	\N	\N	\N	\N	\N	\N	DRAFT
76	29	2224802010366	9.50	8.50	9.00	8.90	3.70	\N	APPROVED
77	30	2224802010366	8.00	7.50	8.00	7.80	3.30	\N	APPROVED
78	31	2224802010366	9.00	9.50	9.00	9.10	4.00	\N	APPROVED
79	32	2224802010366	7.00	6.50	7.00	6.80	3.00	\N	APPROVED
80	33	2224802010366	8.50	8.00	8.50	8.30	3.50	\N	APPROVED
81	34	2224802010366	9.00	8.50	9.50	9.00	4.00	\N	APPROVED
82	35	2224802010366	7.50	7.00	7.50	7.30	3.00	\N	APPROVED
85	38	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
74	37	2224802010365	9.00	9.00	9.00	9.00	4.00	\N	APPROVED
84	37	2224802010366	9.00	9.00	9.00	9.00	4.00	\N	APPROVED
73	36	2224802010365	8.00	8.50	8.00	8.10	3.50	\N	APPROVED
83	36	2224802010366	8.00	8.50	8.00	8.10	3.50	\N	APPROVED
86	39	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
87	40	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
88	41	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
89	42	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
90	43	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
91	44	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
92	45	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
93	46	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
94	47	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
95	48	2224802010366	\N	\N	\N	\N	\N	\N	DRAFT
106	50	2224802010365	2.00	2.00	2.00	2.00	0.00	F	APPROVED
\.


--
-- TOC entry 5178 (class 0 OID 16758)
-- Dependencies: 223
-- Data for Name: lecturers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lecturers (lecturer_id, user_id, faculty_id, degree, phone) FROM stdin;
GV001	94	IET	Tiến sĩ	0987654321
GV002	98	IET	Phó Giáo sư - Tiến sĩ	0934567890
\.


--
-- TOC entry 5177 (class 0 OID 16745)
-- Dependencies: 222
-- Data for Name: majors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.majors (major_id, faculty_id, major_name, total_credits) FROM stdin;
7480201	IET	Công nghệ thông tin	150
\.


--
-- TOC entry 5193 (class 0 OID 16946)
-- Dependencies: 238
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, user_id, title, message, is_read, created_at) FROM stdin;
10	93	Chào mừng Admin	Bạn đã đăng nhập với quyền Quản trị viên	t	2026-03-05 15:20:05.626981
16	96	Chào mừng Sinh viên	Bạn đã đăng ký 10 môn học kỳ này	t	2026-03-05 15:20:05.626981
17	96	Điểm mới	Có 2 môn học đang chờ duyệt điểm	f	2026-03-05 15:20:05.626981
18	96	Yêu cầu học vụ	Yêu cầu phúc khảo của bạn đang được xử lý	f	2026-03-05 15:20:05.626981
19	98	Chào mừng Giảng viên	Bạn có 10 lớp học phần đang giảng dạy trong HK2 2024-2025	f	2026-03-05 16:21:13.518255
\.


--
-- TOC entry 5187 (class 0 OID 16886)
-- Dependencies: 232
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room, week_number, week) FROM stdin;
91	30	3	6	10	C302	\N	2
92	31	4	11	15	C303	\N	2
93	40	2	1	5	A101	\N	2
94	37	2	1	5	A102	\N	2
95	44	3	1	5	A101	\N	2
96	37	3	1	5	A102	\N	2
86	37	8	1	5	B201	\N	1
32	31	3	1	5	A103	1	1
34	33	4	1	5	A105	1	1
36	35	5	1	5	A107	1	1
38	37	6	1	5	A109	1	1
31	30	2	6	10	A102	1	1
33	32	3	6	10	A104	1	1
35	34	4	6	10	A106	1	1
37	36	5	6	10	A108	1	1
39	38	6	6	10	A110	1	1
40	39	2	1	5	B201	1	1
42	41	3	1	5	B203	1	1
44	43	4	1	5	B205	1	1
46	45	5	1	5	B207	1	1
48	47	6	1	5	B209	1	1
41	40	2	6	10	B202	1	1
43	42	3	6	10	B204	1	1
45	44	4	6	10	B206	1	1
47	46	5	6	10	B208	1	1
49	48	6	6	10	B210	1	1
63	29	2	1	5	A101	\N	1
64	31	7	1	5	B201	\N	1
65	34	7	6	10	C302	\N	1
72	40	7	1	5	A104	\N	1
73	43	7	6	10	B205	\N	1
74	44	2	11	15	C301	\N	1
75	44	3	11	15	C302	\N	1
76	45	4	11	15	C303	\N	1
77	45	5	11	15	D401	\N	1
78	46	6	11	15	D402	\N	1
79	46	7	11	15	E501	\N	1
\.


--
-- TOC entry 5185 (class 0 OID 16867)
-- Dependencies: 230
-- Data for Name: section_students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section_students (section_id, student_id, registered_at) FROM stdin;
29	2224802010365	2026-03-05 15:20:05.626981
29	2224802010366	2026-03-05 15:20:05.626981
30	2224802010365	2026-03-05 15:20:05.626981
30	2224802010366	2026-03-05 15:20:05.626981
31	2224802010365	2026-03-05 15:20:05.626981
31	2224802010366	2026-03-05 15:20:05.626981
32	2224802010365	2026-03-05 15:20:05.626981
32	2224802010366	2026-03-05 15:20:05.626981
33	2224802010365	2026-03-05 15:20:05.626981
33	2224802010366	2026-03-05 15:20:05.626981
34	2224802010365	2026-03-05 15:20:05.626981
34	2224802010366	2026-03-05 15:20:05.626981
35	2224802010365	2026-03-05 15:20:05.626981
35	2224802010366	2026-03-05 15:20:05.626981
36	2224802010365	2026-03-05 15:20:05.626981
36	2224802010366	2026-03-05 15:20:05.626981
37	2224802010365	2026-03-05 15:20:05.626981
37	2224802010366	2026-03-05 15:20:05.626981
38	2224802010365	2026-03-05 15:20:05.626981
38	2224802010366	2026-03-05 15:20:05.626981
39	2224802010366	2026-03-05 16:21:13.518255
40	2224802010366	2026-03-05 16:21:13.518255
41	2224802010366	2026-03-05 16:21:13.518255
42	2224802010366	2026-03-05 16:21:13.518255
43	2224802010366	2026-03-05 16:21:13.518255
44	2224802010366	2026-03-05 16:21:13.518255
45	2224802010366	2026-03-05 16:21:13.518255
46	2224802010366	2026-03-05 16:21:13.518255
47	2224802010366	2026-03-05 16:21:13.518255
48	2224802010366	2026-03-05 16:21:13.518255
46	2224802010365	2026-03-09 15:58:48.838681
40	2224802010365	2026-03-09 22:55:04.112093
43	2224802010365	2026-03-09 22:57:25.771945
44	2224802010365	2026-03-09 22:57:31.490034
45	2224802010365	2026-03-09 22:57:35.955163
48	2224802010365	2026-03-09 22:57:39.4814
50	2224802010365	2026-03-11 02:30:29.280574
\.


--
-- TOC entry 5180 (class 0 OID 16792)
-- Dependencies: 225
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (student_id, user_id, class_id, dob, gender, phone, address, gpa_accumulated, status) FROM stdin;
2224802010365	95	D22HT01	2004-05-15	Nữ	0912345678	\N	3.25	STUDYING
2224802010366	96	D22HT01	2004-08-20	Nam	0923456789	\N	3.25	STUDYING
\.


--
-- TOC entry 5182 (class 0 OID 16825)
-- Dependencies: 227
-- Data for Name: subject_prerequisites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subject_prerequisites (subject_id, prerequisite_id) FROM stdin;
\.


--
-- TOC entry 5181 (class 0 OID 16814)
-- Dependencies: 226
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (subject_id, subject_name, credits, description) FROM stdin;
TIN102	Cấu trúc dữ liệu và Giải thuật	2	Các cấu trúc dữ liệu cơ bản
TIN106	Hệ điều hành	2	Quản lý tiến trình, bộ nhớ
TIN110	Trí tuệ nhân tạo	2	Machine Learning cơ bản
TIN202	Học máy và Deep Learning	2	Machine Learning và Neural Networks
TIN206	Cloud Computing	2	AWS, Azure, Google Cloud
TIN210	Ethical Hacking	2	Penetration Testing và Security
TIN101	Nhập môn Lập trình	2	Học lập trình cơ bản với C/C++
TIN103	Cơ sở dữ liệu	2	Thiết kế và quản lý CSDL
TIN104	Lập trình Web	2	HTML, CSS, JavaScript
TIN105	Mạng máy tính	2	Kiến trúc mạng và giao thức
TIN107	Lập trình hướng đối tượng	2	OOP với Java
TIN108	Phân tích thiết kế hệ thống	2	UML và mô hình hóa
TIN109	An toàn thông tin	2	Mã hóa và bảo mật
TIN201	Lập trình Python nâng cao	2	Lập trình Python cho Data Science
TIN203	Xử lý ảnh số	2	Computer Vision cơ bản
TIN204	Lập trình Mobile	2	Phát triển ứng dụng Android/iOS
TIN205	Blockchain và Cryptocurrency	2	Công nghệ Blockchain
TIN207	DevOps và CI/CD	2	Docker, Kubernetes, Jenkins
TIN208	Big Data Analytics	2	Hadoop, Spark, Data Mining
TIN209	IoT và Embedded Systems	2	Internet of Things
CNTT01	Cơ sở lập trình	2	\N
\.


--
-- TOC entry 5175 (class 0 OID 16718)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) FROM stdin;
94	sinfour503@gmail.com	GV001	LECTURER	TS. Nguyễn Văn Minh	\N	t	2026-03-05 15:20:05.626981
96	trungloptruong123@gmail.com	2224802010366	STUDENT	Trần Văn Trung	\N	t	2026-03-05 15:20:05.626981
98	trunggiangvien123@gmail.com	GV002	LECTURER	PGS. TS. Trần Văn Trung	\N	t	2026-03-05 16:14:37.474957
95	2224802010365@student.tdmu.edu.vn	2224802010365	STUDENT	Huỳnh Văn Sang	\N	t	2026-03-05 15:20:05.626981
97	2224802010902@student.tdmu.edu.vn	ADMIN02	ADMIN	Trung admin	\N	t	2026-03-05 16:01:04.65396
93	skillsanh@gmail.com	ADMIN01	ADMIN	Sang admin	\N	t	2026-03-05 15:20:05.626981
100	svtest1@gmail.com	SV001TEST	STUDENT	Sinh Viên Test 1	\N	t	2026-03-11 01:42:16.403363
101	svtest2@gmail.com	SV002TEST	STUDENT	Sinh Viên Test 2	\N	t	2026-03-11 01:42:16.403363
102	svtest3@gmail.com	SV003TEST	STUDENT	Sinh Viên Test 3	\N	t	2026-03-11 01:42:16.403363
103	svtest4@gmail.com	SV004TEST	STUDENT	Sinh Viên Test 4	\N	t	2026-03-11 01:42:16.403363
104	svtest5@gmail.com	SV005TEST	STUDENT	Sinh Viên Test 5	\N	t	2026-03-11 01:42:16.403363
\.


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 235
-- Name: academic_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academic_requests_request_id_seq', 1, false);


--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 228
-- Name: course_sections_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_sections_section_id_seq', 50, true);


--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 233
-- Name: grades_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_grade_id_seq', 114, true);


--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 237
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 19, true);


--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 231
-- Name: schedules_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedules_schedule_id_seq', 97, true);


--
-- TOC entry 5215 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 104, true);


--
-- TOC entry 5001 (class 2606 OID 16939)
-- Name: academic_requests academic_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_requests
    ADD CONSTRAINT academic_requests_pkey PRIMARY KEY (request_id);


--
-- TOC entry 4975 (class 2606 OID 16781)
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (class_id);


--
-- TOC entry 4985 (class 2606 OID 16854)
-- Name: course_sections course_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections
    ADD CONSTRAINT course_sections_pkey PRIMARY KEY (section_id);


--
-- TOC entry 4987 (class 2606 OID 16856)
-- Name: course_sections course_sections_section_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections
    ADD CONSTRAINT course_sections_section_code_key UNIQUE (section_code);


--
-- TOC entry 4967 (class 2606 OID 16744)
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (faculty_id);


--
-- TOC entry 4997 (class 2606 OID 16912)
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (grade_id);


--
-- TOC entry 4971 (class 2606 OID 16763)
-- Name: lecturers lecturers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_pkey PRIMARY KEY (lecturer_id);


--
-- TOC entry 4973 (class 2606 OID 16765)
-- Name: lecturers lecturers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_user_id_key UNIQUE (user_id);


--
-- TOC entry 4969 (class 2606 OID 16752)
-- Name: majors majors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT majors_pkey PRIMARY KEY (major_id);


--
-- TOC entry 5006 (class 2606 OID 16956)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- TOC entry 4995 (class 2606 OID 16895)
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (schedule_id);


--
-- TOC entry 4989 (class 2606 OID 16874)
-- Name: section_students section_students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_students
    ADD CONSTRAINT section_students_pkey PRIMARY KEY (section_id, student_id);


--
-- TOC entry 4977 (class 2606 OID 16801)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (student_id);


--
-- TOC entry 4979 (class 2606 OID 16803)
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- TOC entry 4983 (class 2606 OID 16831)
-- Name: subject_prerequisites subject_prerequisites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_pkey PRIMARY KEY (subject_id, prerequisite_id);


--
-- TOC entry 4981 (class 2606 OID 16824)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (subject_id);


--
-- TOC entry 4999 (class 2606 OID 16914)
-- Name: grades unique_student_grade; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT unique_student_grade UNIQUE (section_id, student_id);


--
-- TOC entry 4961 (class 2606 OID 16733)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4963 (class 2606 OID 16731)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4965 (class 2606 OID 16735)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5002 (class 1259 OID 16969)
-- Name: idx_academic_requests_grade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_academic_requests_grade ON public.academic_requests USING btree (grade_id);


--
-- TOC entry 5003 (class 1259 OID 16968)
-- Name: idx_academic_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_academic_requests_status ON public.academic_requests USING btree (status);


--
-- TOC entry 5004 (class 1259 OID 16967)
-- Name: idx_academic_requests_student; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_academic_requests_student ON public.academic_requests USING btree (student_id);


--
-- TOC entry 4990 (class 1259 OID 17864)
-- Name: idx_schedules_room_week; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schedules_room_week ON public.schedules USING btree (room, week, day_of_week);


--
-- TOC entry 4991 (class 1259 OID 17839)
-- Name: idx_schedules_unique_room_time_week; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_schedules_unique_room_time_week ON public.schedules USING btree (room, day_of_week, week_number, start_period, end_period) WHERE (room IS NOT NULL);


--
-- TOC entry 4992 (class 1259 OID 17863)
-- Name: idx_schedules_week_day; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schedules_week_day ON public.schedules USING btree (week, day_of_week);


--
-- TOC entry 4993 (class 1259 OID 17838)
-- Name: idx_schedules_week_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_schedules_week_number ON public.schedules USING btree (week_number);


--
-- TOC entry 5026 (class 2620 OID 17867)
-- Name: schedules trg_check_lecturer_conflict; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_check_lecturer_conflict BEFORE INSERT OR UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.check_lecturer_schedule_conflict();


--
-- TOC entry 5023 (class 2606 OID 16962)
-- Name: academic_requests academic_requests_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_requests
    ADD CONSTRAINT academic_requests_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(grade_id) ON DELETE SET NULL;


--
-- TOC entry 5024 (class 2606 OID 16940)
-- Name: academic_requests academic_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.academic_requests
    ADD CONSTRAINT academic_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- TOC entry 5010 (class 2606 OID 17489)
-- Name: classes classes_advisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_advisor_id_fkey FOREIGN KEY (advisor_id) REFERENCES public.lecturers(lecturer_id);


--
-- TOC entry 5011 (class 2606 OID 16782)
-- Name: classes classes_major_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_major_id_fkey FOREIGN KEY (major_id) REFERENCES public.majors(major_id);


--
-- TOC entry 5016 (class 2606 OID 17484)
-- Name: course_sections course_sections_lecturer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections
    ADD CONSTRAINT course_sections_lecturer_id_fkey FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(lecturer_id);


--
-- TOC entry 5017 (class 2606 OID 16857)
-- Name: course_sections course_sections_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_sections
    ADD CONSTRAINT course_sections_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- TOC entry 5021 (class 2606 OID 16915)
-- Name: grades grades_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.course_sections(section_id);


--
-- TOC entry 5022 (class 2606 OID 16920)
-- Name: grades grades_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id);


--
-- TOC entry 5008 (class 2606 OID 16771)
-- Name: lecturers lecturers_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(faculty_id);


--
-- TOC entry 5009 (class 2606 OID 16766)
-- Name: lecturers lecturers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5007 (class 2606 OID 16753)
-- Name: majors majors_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.majors
    ADD CONSTRAINT majors_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(faculty_id) ON DELETE SET NULL;


--
-- TOC entry 5025 (class 2606 OID 16957)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5020 (class 2606 OID 16896)
-- Name: schedules schedules_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.course_sections(section_id) ON DELETE CASCADE;


--
-- TOC entry 5018 (class 2606 OID 16875)
-- Name: section_students section_students_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_students
    ADD CONSTRAINT section_students_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.course_sections(section_id) ON DELETE CASCADE;


--
-- TOC entry 5019 (class 2606 OID 16880)
-- Name: section_students section_students_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_students
    ADD CONSTRAINT section_students_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id) ON DELETE CASCADE;


--
-- TOC entry 5012 (class 2606 OID 16809)
-- Name: students students_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(class_id);


--
-- TOC entry 5013 (class 2606 OID 16804)
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5014 (class 2606 OID 16837)
-- Name: subject_prerequisites subject_prerequisites_prerequisite_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_prerequisite_id_fkey FOREIGN KEY (prerequisite_id) REFERENCES public.subjects(subject_id);


--
-- TOC entry 5015 (class 2606 OID 16832)
-- Name: subject_prerequisites subject_prerequisites_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subject_prerequisites
    ADD CONSTRAINT subject_prerequisites_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id);


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-03-11 16:40:10

--
-- PostgreSQL database dump complete
--

\unrestrict M0A0hpLhUbut0c1zr3qDVBsSpxhgZpsQphVcvr0froEOgX80zX5FijzNMlSxrg1

