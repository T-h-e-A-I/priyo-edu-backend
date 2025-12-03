import { pool } from './pool.js';

// Seed detailed course content (chapters, live classes, PDFs, quizzes, questions)
// for the "Complete Machine Learning Bootcamp" course (id = 1).
// Data is adapted from the previous frontend dummy configuration.

const mlQuizQuestions = {
  fundamentals: [
    {
      question:
        'What is the main difference between supervised and unsupervised learning?',
      options: [
        'Supervised learning uses more data',
        'Supervised learning uses labeled data, unsupervised learning uses unlabeled data',
        'Unsupervised learning is more accurate',
        'There is no difference',
      ],
      correctIndex: 1,
    },
    {
      question: 'Which of the following is an example of a classification problem?',
      options: [
        'Predicting house prices',
        'Predicting stock market trends',
        'Email spam detection',
        'Weather forecasting',
      ],
      correctIndex: 2,
    },
    {
      question: 'What is overfitting in machine learning?',
      options: [
        'When a model performs well on training data but poorly on new data',
        'When a model is too simple',
        "When there's not enough training data",
        'When the model trains too quickly',
      ],
      correctIndex: 0,
    },
  ],
  preprocessing: [
    {
      question: 'What is the purpose of data normalization?',
      options: [
        'To remove outliers from the dataset',
        'To scale features to a similar range',
        'To add more features to the dataset',
        'To remove missing values',
      ],
      correctIndex: 1,
    },
    {
      question: 'Which method is commonly used to handle missing values?',
      options: [
        'Always delete rows with missing values',
        'Replace with mean/median/mode or use interpolation',
        'Ignore missing values completely',
        'Convert missing values to zero',
      ],
      correctIndex: 1,
    },
  ],
  supervised: [
    {
      question: 'What is the main advantage of decision trees?',
      options: [
        'They always provide the highest accuracy',
        'They are interpretable and easy to understand',
        'They work only with numerical data',
        'They never overfit',
      ],
      correctIndex: 1,
    },
    {
      question: 'In linear regression, what does the R-squared value represent?',
      options: [
        'The number of features in the model',
        'The training time of the model',
        'The proportion of variance in the dependent variable explained by the model',
        'The number of data points used',
      ],
      correctIndex: 2,
    },
  ],
};

async function seedCourseContent() {
  console.log('Seeding detailed course content for course id=1...');

  // Ensure the base course exists.
  const courseRes = await pool.query(
    'SELECT id FROM courses WHERE id = $1',
    [1],
  );

  if (courseRes.rowCount === 0) {
    throw new Error(
      'Base course with id=1 not found. Run seedCourses.js first.',
    );
  }

  await pool.query('BEGIN');

  try {
    // Clear any existing chapter/module data for this course for idempotent seeding.
    await pool.query('DELETE FROM chapters WHERE course_id = $1', [1]);

    // Chapter 1: Introduction to Machine Learning
    const chapter1 = await pool.query(
      `
        INSERT INTO chapters (course_id, title, position)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [1, 'Introduction to Machine Learning', 0],
    );
    const chapter1Id = chapter1.rows[0].id;

    await pool.query(
      `
        INSERT INTO live_classes (chapter_id, youtube_url, zoom_url, status, scheduled_at)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        chapter1Id,
        'https://www.youtube.com/watch?v=aircAruvnKk',
        null,
        'planned',
        null,
      ],
    );

    await pool.query(
      `
        INSERT INTO pdf_resources (chapter_id, title, file_url, status)
        VALUES ($1, $2, $3, $4)
      `,
      [
        chapter1Id,
        'ML Cheat Sheet',
        '/ml-cheat-sheet.pdf',
        'planned',
      ],
    );

    const chapter1Quiz = await pool.query(
      `
        INSERT INTO quizzes (chapter_id, title, description, status, scheduled_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [
        chapter1Id,
        'ML Fundamentals Quiz',
        'Test your understanding of basic ML concepts',
        'planned',
        null,
      ],
    );
    const chapter1QuizId = chapter1Quiz.rows[0].id;

    for (const q of mlQuizQuestions.fundamentals) {
      await pool.query(
        `
          INSERT INTO quiz_questions (
            quiz_id,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_index
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          chapter1QuizId,
          q.question,
          q.options[0],
          q.options[1],
          q.options[2],
          q.options[3],
          q.correctIndex,
        ],
      );
    }

    // Chapter 2: Data Preprocessing
    const chapter2 = await pool.query(
      `
        INSERT INTO chapters (course_id, title, position)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [1, 'Data Preprocessing', 1],
    );
    const chapter2Id = chapter2.rows[0].id;

    await pool.query(
      `
        INSERT INTO live_classes (chapter_id, youtube_url, zoom_url, status, scheduled_at)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        chapter2Id,
        'https://www.youtube.com/watch?v=aircAruvnKk',
        null,
        'planned',
        null,
      ],
    );

    await pool.query(
      `
        INSERT INTO pdf_resources (chapter_id, title, file_url, status)
        VALUES ($1, $2, $3, $4)
      `,
      [
        chapter2Id,
        'Preprocessing Toolkit',
        '/preprocessing-toolkit.pdf',
        'planned',
      ],
    );

    const chapter2Quiz = await pool.query(
      `
        INSERT INTO quizzes (chapter_id, title, description, status, scheduled_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [
        chapter2Id,
        'Data Preprocessing Quiz',
        'Test your data preprocessing knowledge',
        'planned',
        null,
      ],
    );
    const chapter2QuizId = chapter2Quiz.rows[0].id;

    for (const q of mlQuizQuestions.preprocessing) {
      await pool.query(
        `
          INSERT INTO quiz_questions (
            quiz_id,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_index
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          chapter2QuizId,
          q.question,
          q.options[0],
          q.options[1],
          q.options[2],
          q.options[3],
          q.correctIndex,
        ],
      );
    }

    // Chapter 3: Supervised Learning
    const chapter3 = await pool.query(
      `
        INSERT INTO chapters (course_id, title, position)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [1, 'Supervised Learning', 2],
    );
    const chapter3Id = chapter3.rows[0].id;

    await pool.query(
      `
        INSERT INTO live_classes (chapter_id, youtube_url, zoom_url, status, scheduled_at)
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        chapter3Id,
        'https://www.youtube.com/watch?v=aircAruvnKk',
        null,
        'planned',
        null,
      ],
    );

    await pool.query(
      `
        INSERT INTO pdf_resources (chapter_id, title, file_url, status)
        VALUES ($1, $2, $3, $4)
      `,
      [
        chapter3Id,
        'Supervised Learning Notes',
        '/supervised-learning-notes.pdf',
        'planned',
      ],
    );

    const chapter3Quiz = await pool.query(
      `
        INSERT INTO quizzes (chapter_id, title, description, status, scheduled_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [
        chapter3Id,
        'Supervised Learning Quiz',
        'Test your supervised learning knowledge',
        'planned',
        null,
      ],
    );
    const chapter3QuizId = chapter3Quiz.rows[0].id;

    for (const q of mlQuizQuestions.supervised) {
      await pool.query(
        `
          INSERT INTO quiz_questions (
            quiz_id,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_index
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          chapter3QuizId,
          q.question,
          q.options[0],
          q.options[1],
          q.options[2],
          q.options[3],
          q.correctIndex,
        ],
      );
    }

    await pool.query('COMMIT');
    console.log('Seeding detailed course content completed.');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Seeding detailed course content failed', err);
    throw err;
  } finally {
    await pool.end();
  }
}

seedCourseContent().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


