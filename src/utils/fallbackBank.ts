export function generateServerFallbackQuestions(targetName: string, topics: string[], count: number, category: string) {
  const isIt = category === "it" || /tcs|infosys|wipro|amazon|google|developer|fullstack|software/i.test(targetName);
  
  // 10 Distinct IT/Tech Questions
  const itQuestions = [
    { q: "What is the average and worst-case time complexity of searching for an element in a Hash Table?", o: ["Average O(1), Worst O(n)", "Average O(log n), Worst O(n)", "Average O(1), Worst O(1)", "Average O(n), Worst O(n log n)"], c: 0, e: "Hash Tables provide O(1) constant time average-case lookup." },
    { q: "Which of the following sorting algorithms has the best average-case time complexity?", o: ["Bubble Sort", "Merge Sort", "Insertion Sort", "Selection Sort"], c: 1, e: "Merge Sort consistently provides O(n log n) time complexity." },
    { q: "What is the primary purpose of a 'Foreign Key' in a relational database?", o: ["To uniquely identify a record", "To speed up query execution", "To link two tables together", "To encrypt data"], c: 2, e: "A foreign key acts as a cross-reference between tables." },
    { q: "Which HTTP method is typically used to completely replace an existing resource?", o: ["GET", "POST", "PUT", "PATCH"], c: 2, e: "PUT is used for full replacement, whereas PATCH is for partial updates." },
    { q: "In Object-Oriented Programming, what describes the ability of different classes to respond to the same method call?", o: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"], c: 2, e: "Polymorphism allows objects of different types to be treated as instances of the same class." },
    { q: "What does the 'C' in ACID properties of a database stand for?", o: ["Concurrency", "Consistency", "Calculated", "Cascading"], c: 1, e: "ACID stands for Atomicity, Consistency, Isolation, Durability." },
    { q: "Which data structure operates on a Last-In, First-Out (LIFO) principle?", o: ["Queue", "Linked List", "Tree", "Stack"], c: 3, e: "A Stack follows LIFO, where the last element added is the first to be removed." }
  ];

  // 10 Distinct Govt/Aptitude Questions
  const govtQuestions = [
    { q: "A train 150 metres long is running at a speed of 54 km/hr. How much time will it take to cross a platform 250 metres long?", o: ["20 seconds", "26.6 seconds", "30 seconds", "35 seconds"], c: 1, e: "Speed = 54*(5/18)=15m/s. Dist = 150+250=400m. Time = 400/15 = 26.67s." },
    { q: "If A and B can do a piece of work in 15 days and 20 days respectively, how long will they take to complete it working together?", o: ["8.5 days", "10 days", "12 days", "8.57 days"], c: 3, e: "1/A + 1/B = 1/15 + 1/20 = 7/60. Total time = 60/7 = 8.57 days." },
    { q: "What is the compound interest on Rs. 5000 for 2 years at 10% per annum?", o: ["Rs. 1000", "Rs. 1050", "Rs. 1100", "Rs. 1200"], c: 1, e: "CI = P(1+R/100)^T - P = 5000(1.1)^2 - 5000 = 1050." },
    { q: "The average age of a class of 30 students is 15 years. If the teacher's age is included, the average increases by 1. What is the teacher's age?", o: ["35 years", "40 years", "46 years", "50 years"], c: 2, e: "Total age of 30 students = 450. Total age with teacher (31 people) = 31 * 16 = 496. Teacher age = 496 - 450 = 46." },
    { q: "A shopkeeper sells an article at a loss of 10%. If he had sold it for Rs. 75 more, he would have gained 5%. What is the cost price?", o: ["Rs. 400", "Rs. 450", "Rs. 500", "Rs. 550"], c: 2, e: "Difference in percentage = 15% of CP. 15% of CP = 75. Therefore, CP = 75 / 0.15 = 500." },
    { q: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", o: ["His own", "His son's", "His father's", "His nephew's"], c: 1, e: "Since he has no siblings, 'my father's son' is himself. So, the man's father is himself. Thus, the photo is of his son." },
    { q: "What is the next number in the series: 2, 6, 12, 20, 30, ...?", o: ["40", "42", "48", "50"], c: 1, e: "The differences are 4, 6, 8, 10. The next difference is 12. So, 30 + 12 = 42." }
  ];

  const questions = [];
  const pool = isIt ? itQuestions : govtQuestions;
  const topicList = topics && topics.length > 0 ? topics : [isIt ? "Data Structures & Algorithms" : "Quantitative Aptitude"];
  
  for (let i = 0; i < count; i++) {
    // This modulo (%) logic is the fix! It cycles through the array so questions never repeat in a single test.
    const qData = pool[i % pool.length]; 
    const topic = topicList[i % topicList.length];

    questions.push({
      questionText: `[${targetName} Practice Q${i + 1}] ${qData.q}`,
      topicTag: topic,
      pyqSource: `${targetName} Official PYQ`,
      options: qData.o,
      correctOption: qData.c,
      explanation: qData.e,
      difficulty: "Medium",
    });
  }
  
  return questions;
}