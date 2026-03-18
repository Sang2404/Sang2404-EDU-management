--
-- PostgreSQL database dump
--

\restrict ub4Ujq0hOrib4AphURGj1YwbgapyacWDPlB9iNMjiOtQ0YVUqzUZkx0ER6gzsI4

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

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

INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (8, '2224802010365', 'REVIEW', 'Xin ph├║c khß║úo m├┤n C╞í sß╗ƒ dß╗» liß╗çu v├¼ ─æiß╗âm thi kh├┤ng ph├╣ hß╗úp vß╗¢i b├ái l├ám', 'PENDING', NULL, '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (9, '2224802010365', 'RESERVE', 'Xin bß║úo l╞░u hß╗ìc kß╗│ 2 do l├╜ do gia ─æ├¼nh', 'APPROVED', 'Y├¬u cß║ºu ─æ├ú ─æ╞░ß╗úc chß║Ñp thuß║¡n', '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (10, '2224802010365', 'RETAKE', 'Xin hß╗ìc lß║íi m├┤n Mß║íng m├íy t├¡nh ─æß╗â cß║úi thiß╗çn ─æiß╗âm', 'REJECTED', 'Y├¬u cß║ºu kh├┤ng ─æß╗º ─æiß╗üu kiß╗çn', '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (11, '2224802010366', 'REVIEW', 'Xin ph├║c khß║úo m├┤n C╞í sß╗ƒ dß╗» liß╗çu v├¼ ─æiß╗âm thi kh├┤ng ph├╣ hß╗úp vß╗¢i b├ái l├ám', 'PENDING', NULL, '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (12, '2224802010366', 'RESERVE', 'Xin bß║úo l╞░u hß╗ìc kß╗│ 2 do l├╜ do gia ─æ├¼nh', 'APPROVED', 'Y├¬u cß║ºu ─æ├ú ─æ╞░ß╗úc chß║Ñp thuß║¡n', '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (13, '2224802010366', 'RETAKE', 'Xin hß╗ìc lß║íi m├┤n Mß║íng m├íy t├¡nh ─æß╗â cß║úi thiß╗çn ─æiß╗âm', 'REJECTED', 'Y├¬u cß║ºu kh├┤ng ─æß╗º ─æiß╗üu kiß╗çn', '2026-03-05 15:20:05.626981', '2026-03-05 15:20:05.626981', NULL);
INSERT INTO public.academic_requests (request_id, student_id, request_type, reason, status, admin_response, created_at, updated_at, grade_id) VALUES (14, '2224802010366', 'REVIEW', '12312333333333333333333333', 'PENDING', NULL, '2026-03-05 15:40:40.907152', '2026-03-05 15:40:40.907152', 84);


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.classes (class_id, major_id, advisor_id, class_name, enrollment_year) VALUES ('D22HT01', '7480201', 'GV001', '─ÉH CNTT K14 - Lß╗¢p 01', 2022);


--
-- Data for Name: course_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (29, 'TIN101', 'GV001', 'HK1', '2024-2025', 'A101', 60, 'TIN101-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (30, 'TIN102', 'GV001', 'HK1', '2024-2025', 'A102', 60, 'TIN102-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (31, 'TIN103', 'GV001', 'HK1', '2024-2025', 'A103', 60, 'TIN103-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (32, 'TIN104', 'GV001', 'HK1', '2024-2025', 'A104', 60, 'TIN104-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (33, 'TIN105', 'GV001', 'HK1', '2024-2025', 'A105', 60, 'TIN105-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (34, 'TIN106', 'GV001', 'HK1', '2024-2025', 'A106', 60, 'TIN106-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (35, 'TIN107', 'GV001', 'HK1', '2024-2025', 'A107', 60, 'TIN107-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (36, 'TIN108', 'GV001', 'HK1', '2024-2025', 'A108', 60, 'TIN108-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (37, 'TIN109', 'GV001', 'HK1', '2024-2025', 'A109', 60, 'TIN109-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (38, 'TIN110', 'GV001', 'HK1', '2024-2025', 'A110', 60, 'TIN110-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (39, 'TIN201', 'GV002', 'HK2', '2024-2025', 'B201', 60, 'TIN201-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (40, 'TIN202', 'GV002', 'HK2', '2024-2025', 'B202', 60, 'TIN202-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (41, 'TIN203', 'GV002', 'HK2', '2024-2025', 'B203', 60, 'TIN203-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (42, 'TIN204', 'GV002', 'HK2', '2024-2025', 'B204', 60, 'TIN204-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (43, 'TIN205', 'GV002', 'HK2', '2024-2025', 'B205', 60, 'TIN205-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (44, 'TIN206', 'GV002', 'HK2', '2024-2025', 'B206', 60, 'TIN206-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (45, 'TIN207', 'GV002', 'HK2', '2024-2025', 'B207', 60, 'TIN207-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (46, 'TIN208', 'GV002', 'HK2', '2024-2025', 'B208', 60, 'TIN208-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (47, 'TIN209', 'GV002', 'HK2', '2024-2025', 'B209', 60, 'TIN209-01', false);
INSERT INTO public.course_sections (section_id, subject_id, lecturer_id, semester, academic_year, room_default, max_capacity, section_code, is_locked) VALUES (48, 'TIN210', 'GV002', 'HK2', '2024-2025', 'B210', 60, 'TIN210-01', false);


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.faculties (faculty_id, faculty_name, description) VALUES ('IET', 'Viß╗çn Kß╗╣ thuß║¡t - C├┤ng nghß╗ç', '─É├áo tß║ío c├íc ng├ánh kß╗╣ thuß║¡t');


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (66, 29, '2224802010365', 9.50, 8.50, 9.00, 8.90, 3.70, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (67, 30, '2224802010365', 8.00, 7.50, 8.00, 7.80, 3.30, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (68, 31, '2224802010365', 9.00, 9.50, 9.00, 9.10, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (69, 32, '2224802010365', 7.00, 6.50, 7.00, 6.80, 3.00, 'B', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (70, 33, '2224802010365', 8.50, 8.00, 8.50, 8.30, 3.50, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (71, 34, '2224802010365', 9.00, 8.50, 9.50, 9.00, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (72, 35, '2224802010365', 7.50, 7.00, 7.50, 7.30, 3.00, 'B', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (75, 38, '2224802010365', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (76, 29, '2224802010366', 9.50, 8.50, 9.00, 8.90, 3.70, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (77, 30, '2224802010366', 8.00, 7.50, 8.00, 7.80, 3.30, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (78, 31, '2224802010366', 9.00, 9.50, 9.00, 9.10, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (79, 32, '2224802010366', 7.00, 6.50, 7.00, 6.80, 3.00, 'B', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (80, 33, '2224802010366', 8.50, 8.00, 8.50, 8.30, 3.50, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (81, 34, '2224802010366', 9.00, 8.50, 9.50, 9.00, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (82, 35, '2224802010366', 7.50, 7.00, 7.50, 7.30, 3.00, 'B', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (85, 38, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (74, 37, '2224802010365', 9.00, 9.00, 9.00, 9.00, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (84, 37, '2224802010366', 9.00, 9.00, 9.00, 9.00, 4.00, 'A', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (73, 36, '2224802010365', 8.00, 8.50, 8.00, 8.10, 3.50, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (83, 36, '2224802010366', 8.00, 8.50, 8.00, 8.10, 3.50, 'B+', 'APPROVED');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (86, 39, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (87, 40, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (88, 41, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (89, 42, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (90, 43, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (91, 44, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (92, 45, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (93, 46, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (94, 47, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');
INSERT INTO public.grades (grade_id, section_id, student_id, attendance, midterm, final, total_10, total_4, grade_char, status) VALUES (95, 48, '2224802010366', NULL, NULL, NULL, NULL, NULL, NULL, 'DRAFT');


--
-- Data for Name: lecturers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.lecturers (lecturer_id, user_id, faculty_id, degree, phone) VALUES ('GV001', 94, 'IET', 'Tiß║┐n s─⌐', '0987654321');
INSERT INTO public.lecturers (lecturer_id, user_id, faculty_id, degree, phone) VALUES ('GV002', 98, 'IET', 'Ph├│ Gi├ío s╞░ - Tiß║┐n s─⌐', '0934567890');


--
-- Data for Name: majors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.majors (major_id, faculty_id, major_name, total_credits) VALUES ('7480201', 'IET', 'C├┤ng nghß╗ç th├┤ng tin', 150);


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (10, 93, 'Ch├áo mß╗½ng Admin', 'Bß║ín ─æ├ú ─æ─âng nhß║¡p vß╗¢i quyß╗ün Quß║ún trß╗ï vi├¬n', true, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (11, 94, 'Ch├áo mß╗½ng Giß║úng vi├¬n', 'Bß║ín c├│ 10 lß╗¢p hß╗ìc phß║ºn ─æang giß║úng dß║íy', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (12, 94, 'Nhß║»c nhß╗ƒ nhß║¡p ─æiß╗âm', 'C├▓n 1 lß╗¢p ch╞░a ho├án th├ánh nhß║¡p ─æiß╗âm', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (13, 95, 'Ch├áo mß╗½ng Sinh vi├¬n', 'Bß║ín ─æ├ú ─æ─âng k├╜ 10 m├┤n hß╗ìc kß╗│ n├áy', true, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (14, 95, '─Éiß╗âm mß╗¢i', 'C├│ 2 m├┤n hß╗ìc ─æang chß╗¥ duyß╗çt ─æiß╗âm', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (15, 95, 'Y├¬u cß║ºu hß╗ìc vß╗Ñ', 'Y├¬u cß║ºu ph├║c khß║úo cß╗ºa bß║ín ─æang ─æ╞░ß╗úc xß╗¡ l├╜', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (16, 96, 'Ch├áo mß╗½ng Sinh vi├¬n', 'Bß║ín ─æ├ú ─æ─âng k├╜ 10 m├┤n hß╗ìc kß╗│ n├áy', true, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (17, 96, '─Éiß╗âm mß╗¢i', 'C├│ 2 m├┤n hß╗ìc ─æang chß╗¥ duyß╗çt ─æiß╗âm', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (18, 96, 'Y├¬u cß║ºu hß╗ìc vß╗Ñ', 'Y├¬u cß║ºu ph├║c khß║úo cß╗ºa bß║ín ─æang ─æ╞░ß╗úc xß╗¡ l├╜', false, '2026-03-05 15:20:05.626981');
INSERT INTO public.notifications (notification_id, user_id, title, message, is_read, created_at) VALUES (19, 98, 'Ch├áo mß╗½ng Giß║úng vi├¬n', 'Bß║ín c├│ 10 lß╗¢p hß╗ìc phß║ºn ─æang giß║úng dß║íy trong HK2 2024-2025', false, '2026-03-05 16:21:13.518255');


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (30, 29, 2, 1, 5, 'A101');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (32, 31, 3, 1, 5, 'A103');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (34, 33, 4, 1, 5, 'A105');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (36, 35, 5, 1, 5, 'A107');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (38, 37, 6, 1, 5, 'A109');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (31, 30, 2, 6, 10, 'A102');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (33, 32, 3, 6, 10, 'A104');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (35, 34, 4, 6, 10, 'A106');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (37, 36, 5, 6, 10, 'A108');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (39, 38, 6, 6, 10, 'A110');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (40, 39, 2, 1, 5, 'B201');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (42, 41, 3, 1, 5, 'B203');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (44, 43, 4, 1, 5, 'B205');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (46, 45, 5, 1, 5, 'B207');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (48, 47, 6, 1, 5, 'B209');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (41, 40, 2, 6, 10, 'B202');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (43, 42, 3, 6, 10, 'B204');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (45, 44, 4, 6, 10, 'B206');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (47, 46, 5, 6, 10, 'B208');
INSERT INTO public.schedules (schedule_id, section_id, day_of_week, start_period, end_period, room) VALUES (49, 48, 6, 6, 10, 'B210');


--
-- Data for Name: section_students; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (29, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (29, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (30, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (30, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (31, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (31, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (32, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (32, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (33, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (33, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (34, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (34, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (35, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (35, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (36, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (36, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (37, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (37, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (38, '2224802010365', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (38, '2224802010366', '2026-03-05 15:20:05.626981');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (39, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (40, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (41, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (42, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (43, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (44, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (45, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (46, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (47, '2224802010366', '2026-03-05 16:21:13.518255');
INSERT INTO public.section_students (section_id, student_id, registered_at) VALUES (48, '2224802010366', '2026-03-05 16:21:13.518255');


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.students (student_id, user_id, class_id, dob, gender, phone, address, gpa_accumulated, status) VALUES ('2224802010365', 95, 'D22HT01', '2004-05-15', 'Nß╗»', '0912345678', NULL, 3.25, 'STUDYING');
INSERT INTO public.students (student_id, user_id, class_id, dob, gender, phone, address, gpa_accumulated, status) VALUES ('2224802010366', 96, 'D22HT01', '2004-08-20', 'Nam', '0923456789', NULL, 3.25, 'STUDYING');


--
-- Data for Name: subject_prerequisites; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN101', 'Nhß║¡p m├┤n Lß║¡p tr├¼nh', 3, 'Hß╗ìc lß║¡p tr├¼nh c╞í bß║ún vß╗¢i C/C++');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN102', 'Cß║Ñu tr├║c dß╗» liß╗çu v├á Giß║úi thuß║¡t', 4, 'C├íc cß║Ñu tr├║c dß╗» liß╗çu c╞í bß║ún');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN103', 'C╞í sß╗ƒ dß╗» liß╗çu', 3, 'Thiß║┐t kß║┐ v├á quß║ún l├╜ CSDL');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN104', 'Lß║¡p tr├¼nh Web', 3, 'HTML, CSS, JavaScript');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN105', 'Mß║íng m├íy t├¡nh', 3, 'Kiß║┐n tr├║c mß║íng v├á giao thß╗⌐c');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN106', 'Hß╗ç ─æiß╗üu h├ánh', 4, 'Quß║ún l├╜ tiß║┐n tr├¼nh, bß╗Ö nhß╗¢');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN107', 'Lß║¡p tr├¼nh h╞░ß╗¢ng ─æß╗æi t╞░ß╗úng', 3, 'OOP vß╗¢i Java');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN108', 'Ph├ón t├¡ch thiß║┐t kß║┐ hß╗ç thß╗æng', 3, 'UML v├á m├┤ h├¼nh h├│a');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN109', 'An to├án th├┤ng tin', 3, 'M├ú h├│a v├á bß║úo mß║¡t');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN110', 'Tr├¡ tuß╗ç nh├ón tß║ío', 4, 'Machine Learning c╞í bß║ún');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN201', 'Lß║¡p tr├¼nh Python n├óng cao', 3, 'Lß║¡p tr├¼nh Python cho Data Science');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN202', 'Hß╗ìc m├íy v├á Deep Learning', 4, 'Machine Learning v├á Neural Networks');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN203', 'Xß╗¡ l├╜ ß║únh sß╗æ', 3, 'Computer Vision c╞í bß║ún');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN204', 'Lß║¡p tr├¼nh Mobile', 3, 'Ph├ít triß╗ân ß╗⌐ng dß╗Ñng Android/iOS');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN205', 'Blockchain v├á Cryptocurrency', 3, 'C├┤ng nghß╗ç Blockchain');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN206', 'Cloud Computing', 4, 'AWS, Azure, Google Cloud');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN207', 'DevOps v├á CI/CD', 3, 'Docker, Kubernetes, Jenkins');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN208', 'Big Data Analytics', 3, 'Hadoop, Spark, Data Mining');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN209', 'IoT v├á Embedded Systems', 3, 'Internet of Things');
INSERT INTO public.subjects (subject_id, subject_name, credits, description) VALUES ('TIN210', 'Ethical Hacking', 4, 'Penetration Testing v├á Security');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (93, 'skillsanh@gmail.com', 'ADMIN01', 'ADMIN', 'Quß║ún trß╗ï vi├¬n Hß╗ç thß╗æng', NULL, true, '2026-03-05 15:20:05.626981');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (94, 'sinfour503@gmail.com', 'GV001', 'LECTURER', 'TS. Nguyß╗àn V─ân Minh', NULL, true, '2026-03-05 15:20:05.626981');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (95, '2224802010365@student.tdmu.edu.vn', '2224802010365', 'STUDENT', 'Nguyß╗àn Thß╗ï H╞░╞íng', NULL, true, '2026-03-05 15:20:05.626981');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (96, 'trungloptruong123@gmail.com', '2224802010366', 'STUDENT', 'Trß║ºn V─ân Trung', NULL, true, '2026-03-05 15:20:05.626981');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (97, '2224802010902@student.tdmu.edu.vn', 'dangdinhtrung', 'ADMIN', '─Éß║╖ng ─É├¼nh Trung', NULL, true, '2026-03-05 16:01:04.65396');
INSERT INTO public.users (user_id, email, username, role, full_name, avatar_url, is_active, created_at) VALUES (98, 'trunggiangvien123@gmail.com', 'GV002', 'LECTURER', 'PGS. TS. Trß║ºn V─ân Trung', NULL, true, '2026-03-05 16:14:37.474957');


--
-- Name: academic_requests_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.academic_requests_request_id_seq', 14, true);


--
-- Name: course_sections_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_sections_section_id_seq', 48, true);


--
-- Name: grades_grade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_grade_id_seq', 95, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 19, true);


--
-- Name: schedules_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedules_schedule_id_seq', 49, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 100, true);


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

\unrestrict ub4Ujq0hOrib4AphURGj1YwbgapyacWDPlB9iNMjiOtQ0YVUqzUZkx0ER6gzsI4

