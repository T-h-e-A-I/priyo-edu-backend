import { pool } from './pool.js';

// Seed the detailed course data that was previously hardcoded in the frontend courses page.
const seedData = [
  {
    id: 1,
    title: 'Complete Machine Learning Bootcamp',
    description:
      'Master machine learning from basics to advanced concepts with hands-on projects and real-world applications.',
    category: 'ai',
    instructor: 'Dr. Sarah Johnson',
    duration: '12 hours',
    students: 2847,
    rating: 4.8,
    price: '$89',
    level: 'Beginner',
    thumbnail: '/machine-learning-course-thumbnail.png',
    videos: 45,
    quizzes: 8,
    pdfs: 12,
  },
  {
    id: 2,
    title: 'Deep Learning with Neural Networks',
    description: 'Dive deep into neural networks, CNNs, RNNs, and transformers with practical implementations.',
    category: 'ai',
    instructor: 'Prof. Michael Chen',
    duration: '18 hours',
    students: 1923,
    rating: 4.9,
    price: '$129',
    level: 'Advanced',
    thumbnail: '/deep-learning-course.png',
    videos: 62,
    quizzes: 12,
    pdfs: 18,
  },
  {
    id: 3,
    title: 'JavaScript Fundamentals to Advanced',
    description:
      'Complete JavaScript course covering ES6+, async programming, DOM manipulation, and modern frameworks.',
    category: 'programming',
    instructor: 'Alex Rodriguez',
    duration: '15 hours',
    students: 4521,
    rating: 4.7,
    price: '$79',
    level: 'Beginner',
    thumbnail: '/javascript-programming-course-thumbnail.png',
    videos: 58,
    quizzes: 15,
    pdfs: 20,
  },
  {
    id: 4,
    title: 'React & Next.js Full Stack Development',
    description: 'Build modern web applications with React, Next.js, and TypeScript from scratch to deployment.',
    category: 'programming',
    instructor: 'Emma Thompson',
    duration: '22 hours',
    students: 3654,
    rating: 4.8,
    price: '$149',
    level: 'Intermediate',
    thumbnail: '/react-nextjs-full-stack-development-course.png',
    videos: 78,
    quizzes: 18,
    pdfs: 25,
  },
  {
    id: 5,
    title: 'Professional Video Editing with DaVinci Resolve',
    description: 'Master professional video editing, color grading, and audio post-production techniques.',
    category: 'video-editing',
    instructor: 'James Wilson',
    duration: '14 hours',
    students: 2156,
    rating: 4.6,
    price: '$99',
    level: 'Intermediate',
    thumbnail: '/davinci-resolve-video-editing-course.png',
    videos: 42,
    quizzes: 6,
    pdfs: 15,
  },
  {
    id: 6,
    title: 'Adobe Premiere Pro Masterclass',
    description:
      'Complete guide to video editing with Premiere Pro, from basic cuts to advanced effects and workflows.',
    category: 'video-editing',
    instructor: 'Lisa Garcia',
    duration: '16 hours',
    students: 3287,
    rating: 4.7,
    price: '$119',
    level: 'Beginner',
    thumbnail: '/adobe-premiere-pro-masterclass-course.png',
    videos: 54,
    quizzes: 9,
    pdfs: 18,
  },
  {
    id: 7,
    title: 'n8n Workflow Automation Mastery',
    description: 'Build powerful automation workflows with n8n, integrate APIs, and streamline business processes.',
    category: 'n8n',
    instructor: 'David Kumar',
    duration: '10 hours',
    students: 1432,
    rating: 4.5,
    price: '$69',
    level: 'Beginner',
    thumbnail: '/n8n-workflow-automation-course.png',
    videos: 35,
    quizzes: 7,
    pdfs: 10,
  },
  {
    id: 8,
    title: 'Advanced n8n Integration Patterns',
    description: 'Advanced n8n techniques, custom nodes, complex workflows, and enterprise automation solutions.',
    category: 'n8n',
    instructor: 'Maria Santos',
    duration: '12 hours',
    students: 876,
    rating: 4.6,
    price: '$89',
    level: 'Advanced',
    thumbnail: '/advanced-n8n-integration-patterns-course.png',
    videos: 38,
    quizzes: 8,
    pdfs: 12,
  },
];

async function seedCourses() {
  console.log('Seeding courses...');

  for (const course of seedData) {
    await pool.query(
      `
        INSERT INTO courses (id, title, description, category, instructor, duration, students, rating, price, level, thumbnail, videos, quizzes, pdfs)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE
        SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          instructor = EXCLUDED.instructor,
          duration = EXCLUDED.duration,
          students = EXCLUDED.students,
          rating = EXCLUDED.rating,
          price = EXCLUDED.price,
          level = EXCLUDED.level,
          thumbnail = EXCLUDED.thumbnail,
          videos = EXCLUDED.videos,
          quizzes = EXCLUDED.quizzes,
          pdfs = EXCLUDED.pdfs,
          updated_at = NOW()
      `,
      [
        course.id,
        course.title,
        course.description,
        course.category,
        course.instructor,
        course.duration,
        course.students,
        course.rating,
        course.price,
        course.level,
        course.thumbnail,
        course.videos,
        course.quizzes,
        course.pdfs,
      ],
    );
  }

  console.log('Seeding completed.');
}

seedCourses()
  .catch((err) => {
    console.error('Seeding courses failed', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });


