// Seed data generator for testing

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'James',
  'Mia', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Henry', 'Harper', 'Alexander', 'Evelyn', 'Michael',
  'Abigail', 'Daniel', 'Emily', 'Matthew', 'Elizabeth', 'Aiden', 'Sofia', 'Joseph', 'Avery', 'David',
  'Ella', 'Jackson', 'Madison', 'Sebastian', 'Scarlett', 'Carter', 'Victoria', 'Wyatt', 'Aria', 'Jayden',
  'Grace', 'Luke', 'Chloe', 'Grayson', 'Penelope', 'Jack', 'Riley', 'Julian', 'Layla', 'Levi',
  'Nora', 'Isaac', 'Zoey', 'Owen', 'Mila', 'Theo', 'Aubrey', 'Connor', 'Hannah', 'Caleb',
  'Addison', 'Ryan', 'Eleanor', 'Nathan', 'Natalie', 'Zachary', 'Lily', 'Eli', 'Lillian', 'Aaron',
  'Aurora', 'Hunter', 'Savannah', 'Adrian', 'Leah', 'Jonathan', 'Bella', 'Jeremiah', 'Stella', 'Easton',
  'Zoe', 'Jaxon', 'Hazel', 'Cooper', 'Ellie', 'Brayden', 'Paisley', 'Jordan', 'Audrey', 'Nicholas',
  'Skylar', 'Evan', 'Violet', 'Tyler', 'Claire', 'Colton', 'Brielle', 'Angel', 'Lucy', 'Dominic',
  'Anna', 'Austin', 'Caroline', 'Ian', 'Nova', 'Adam', 'Genesis', 'Elias', 'Aaliyah', 'Jaxson',
  'Kennedy', 'Greyson', 'Kinsley', 'Josiah', 'Allison', 'Ezekiel', 'Maya', 'Carson', 'Sarah', 'Maverick',
  'Ariana', 'Bryson', 'Alice', 'Roman', 'Gabriella', 'Jason', 'Madelyn', 'Xavier', 'Cora', 'Jose',
  'Raelynn', 'Jace', 'Ruby', 'Sawyer', 'Eva', 'Kayden', 'Serenity', 'Bentley', 'Autumn', 'Ashton',
  'Nevaeh', 'Brody', 'Willow', 'Gavin', 'Quinn', 'Ryder', 'Natalia', 'Micah', 'Delilah', 'Parker',
  'Isla', 'Axel', 'Brooklyn', 'Ayden', 'Valentina', 'Declan', 'Clara', 'Brantley', 'Sophie', 'Colin',
  'Piper', 'Damian', 'Rylee', 'Waylon', 'Hadley', 'Miles', 'Peyton', 'Silas', 'Natalie', 'Vincent'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
  'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
  'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips',
  'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
  'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks',
  'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez',
  'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins',
  'Perry', 'Butler', 'Barnes', 'Fisher', 'Henderson', 'Coleman', 'Simmons', 'Patterson', 'Jordan', 'Reynolds',
  'Hamilton', 'Graham', 'Kim', 'Gonzales', 'Alexander', 'Ramos', 'Wallace', 'Griffin', 'West', 'Cole',
  'Hayes', 'Chavez', 'Gibson', 'Bryant', 'Ellis', 'Stevens', 'Murray', 'Ford', 'Marshall', 'Owens',
  'Mcdonald', 'Harrison', 'Ruiz', 'Kennedy', 'Wells', 'Alvarez', 'Woods', 'Mendoza', 'Castillo', 'Olson'
];

const classNames = [
  'Aerial Silks', 'Acrobatics', 'Juggling', 'Clowning', 'Tightrope', 
  'Trapeze', 'Aerial Hoop', 'Hand Balancing', 'Contortion', 'Tumbling'
];

const timeSlots = {
  morning: ['09:00', '10:00', '11:00'],
  evening: ['17:00', '18:00', '19:00', '20:00']
};

export function generateSeedData() {
  const students = [];
  const lessons = [];
  const coaches = [
    { id: 'coach1', name: 'Sarah Johnson', email: 'sarah@circus.com', phone: '+1-555-0101' },
    { id: 'coach2', name: 'Michael Chen', email: 'michael@circus.com', phone: '+1-555-0102' },
  ];

  // Generate 200 students
  for (let i = 0; i < 200; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    
    // Random payment date (within last 3 months)
    const paymentDate = new Date();
    paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 90));
    
    // Format payment date as yyyy-MM-dd
    const paymentDateStr = formatDate(paymentDate);
    
    // Calculate lessons count (0-9, can be negative)
    const lessonsCount = Math.floor(Math.random() * 10) - 1; // -1 to 8
    
    students.push({
      id: `student_${i + 1}`,
      name,
      classSeries: [], // Will be assigned after lessons are created
      lastPaymentDate: paymentDateStr,
      lessonsCount: lessonsCount,
      payments: [{
        id: `payment_${i + 1}`,
        date: paymentDate.toISOString(),
        lessons: 8,
        amount: 1,
      }],
      visits: [],
      editHistory: [],
    });
  }

  // Generate 10 class series with 1 year duration
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let lessonIdCounter = 1;

  // Create 10 diverse class series
  for (let i = 0; i < 10; i++) {
    const day = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
    const isMorning = Math.random() > 0.5;
    const time = isMorning 
      ? timeSlots.morning[Math.floor(Math.random() * timeSlots.morning.length)]
      : timeSlots.evening[Math.floor(Math.random() * timeSlots.evening.length)];
    const className = classNames[Math.floor(Math.random() * classNames.length)];
    const coach = coaches[Math.floor(Math.random() * coaches.length)];
    
    // Start date: 30 days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // End date: 1 year from start date (365 days)
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    const lesson = {
      id: `lesson_${lessonIdCounter++}`,
      name: className,
      dayOfWeek: day,
      startTime: time,
      coachId: coach.id,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      participants: [],
    };
    lessons.push(lesson);
  }

  // Chaotically assign students to classes
  students.forEach(student => {
    // Each student assigned to 1-4 random classes
    const numClasses = Math.floor(Math.random() * 4) + 1;
    const shuffledLessons = [...lessons].sort(() => Math.random() - 0.5);
    const assignedClasses = shuffledLessons.slice(0, numClasses);
    
    student.classSeries = assignedClasses.map(l => l.id);
    
    // Add student to lesson participants
    assignedClasses.forEach(lesson => {
      if (!lesson.participants.includes(student.id)) {
        lesson.participants.push(student.id);
      }
    });
  });

  return {
    students,
    coaches,
    lessons,
    visits: [],
    lessonOccurrences: {},
    membershipConfig: {
      lessonsPerPayment: 8,
      freeSkipLessons: 1,
    },
  };
}

// Helper function to format date
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
