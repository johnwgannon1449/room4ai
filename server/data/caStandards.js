// California K-12 Standards — representative sample across grades and subjects
const CA_STANDARDS = {
  // Common Core ELA
  ELA: {
    'K': [
      { code: 'CCSS.ELA-K.RL.1', description: 'With prompting and support, ask and answer questions about key details in a text.' },
      { code: 'CCSS.ELA-K.RL.2', description: 'With prompting and support, retell familiar stories, including key details.' },
      { code: 'CCSS.ELA-K.RF.1', description: 'Demonstrate understanding of the organization and basic features of print.' },
      { code: 'CCSS.ELA-K.W.1', description: 'Use a combination of drawing, dictating, and writing to compose opinion pieces.' },
      { code: 'CCSS.ELA-K.SL.1', description: 'Participate in collaborative conversations about kindergarten topics.' },
    ],
    '1': [
      { code: 'CCSS.ELA-1.RL.1', description: 'Ask and answer questions about key details in a text.' },
      { code: 'CCSS.ELA-1.RL.3', description: 'Describe characters, settings, and major events in a story.' },
      { code: 'CCSS.ELA-1.RF.2', description: 'Demonstrate understanding of spoken words, syllables, and sounds.' },
      { code: 'CCSS.ELA-1.W.2', description: 'Write informative/explanatory texts that name a topic, supply some facts.' },
      { code: 'CCSS.ELA-1.L.1', description: 'Demonstrate command of conventions of standard English grammar.' },
    ],
    '2': [
      { code: 'CCSS.ELA-2.RL.1', description: 'Ask and answer such questions as who, what, where, when, why, and how.' },
      { code: 'CCSS.ELA-2.RI.3', description: 'Describe the connection between a series of historical events, steps in technical procedures.' },
      { code: 'CCSS.ELA-2.W.1', description: 'Write opinion pieces in which they introduce the topic, state an opinion.' },
      { code: 'CCSS.ELA-2.L.2', description: 'Demonstrate command of the conventions of standard English capitalization, punctuation.' },
      { code: 'CCSS.ELA-2.SL.4', description: 'Tell a story or recount an experience with appropriate facts and relevant details.' },
    ],
    '3': [
      { code: 'CCSS.ELA-3.RL.3', description: 'Describe characters in a story and explain how their actions contribute to the sequence of events.' },
      { code: 'CCSS.ELA-3.RI.1', description: 'Ask and answer questions to demonstrate understanding of a text.' },
      { code: 'CCSS.ELA-3.W.2', description: 'Write informative/explanatory texts to examine a topic and convey ideas clearly.' },
      { code: 'CCSS.ELA-3.W.3', description: 'Write narratives to develop real or imagined experiences or events.' },
      { code: 'CCSS.ELA-3.L.4', description: 'Determine or clarify the meaning of unknown and multiple-meaning words and phrases.' },
    ],
    '4': [
      { code: 'CCSS.ELA-4.RL.1', description: 'Refer to details and examples in a text when explaining what the text says explicitly.' },
      { code: 'CCSS.ELA-4.RI.7', description: 'Interpret information presented visually, orally, or quantitatively.' },
      { code: 'CCSS.ELA-4.W.1', description: 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information.' },
      { code: 'CCSS.ELA-4.SL.4', description: 'Report on a topic or text, tell a story, or recount an experience.' },
      { code: 'CCSS.ELA-4.L.1', description: 'Demonstrate command of the conventions of standard English grammar and usage.' },
    ],
    '5': [
      { code: 'CCSS.ELA-5.RL.2', description: 'Determine a theme of a story, drama, or poem from details in the text.' },
      { code: 'CCSS.ELA-5.RI.6', description: 'Analyze multiple accounts of the same event or topic, noting similarities and differences.' },
      { code: 'CCSS.ELA-5.W.1', description: 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information.' },
      { code: 'CCSS.ELA-5.W.2', description: 'Write informative/explanatory texts to examine a topic and convey ideas clearly.' },
      { code: 'CCSS.ELA-5.L.3', description: 'Use knowledge of language and its conventions when writing, speaking, reading, or listening.' },
    ],
    '6': [
      { code: 'CCSS.ELA-6.RL.1', description: 'Cite textual evidence to support analysis of what the text says explicitly and inferences drawn.' },
      { code: 'CCSS.ELA-6.RI.2', description: 'Determine a central idea of a text and how it is conveyed through particular details.' },
      { code: 'CCSS.ELA-6.W.1', description: 'Write arguments to support claims with clear reasons and relevant evidence.' },
      { code: 'CCSS.ELA-6.W.3', description: 'Write narratives to develop real or imagined experiences or events using effective technique.' },
      { code: 'CCSS.ELA-6.SL.1', description: 'Engage effectively in a range of collaborative discussions with diverse partners.' },
    ],
    '7': [
      { code: 'CCSS.ELA-7.RL.2', description: 'Determine a theme or central idea of a text and analyze its development over the course of the text.' },
      { code: 'CCSS.ELA-7.RI.8', description: 'Trace and evaluate the argument and specific claims in a text.' },
      { code: 'CCSS.ELA-7.W.1', description: 'Write arguments to support claims with clear reasons and relevant evidence.' },
      { code: 'CCSS.ELA-7.W.4', description: 'Produce clear and coherent writing in which the development, organization, and style are appropriate.' },
      { code: 'CCSS.ELA-7.L.4', description: 'Determine or clarify the meaning of unknown and multiple-meaning words and phrases.' },
    ],
    '8': [
      { code: 'CCSS.ELA-8.RL.3', description: 'Analyze how particular lines of dialogue or incidents in a story reveal character and provoke decisions.' },
      { code: 'CCSS.ELA-8.RI.1', description: 'Cite the textual evidence that most strongly supports an analysis of what the text says.' },
      { code: 'CCSS.ELA-8.W.1', description: 'Write arguments to support claims with clear reasons and relevant evidence.' },
      { code: 'CCSS.ELA-8.W.2', description: 'Write informative/explanatory texts to examine a topic and convey ideas clearly.' },
      { code: 'CCSS.ELA-8.SL.4', description: 'Present claims and findings, emphasizing salient points in a focused, coherent manner.' },
    ],
    '9-10': [
      { code: 'CCSS.ELA-9-10.RL.1', description: 'Cite strong and thorough textual evidence to support analysis of what the text says.' },
      { code: 'CCSS.ELA-9-10.RI.6', description: 'Determine an author\'s point of view or purpose in a text and analyze how an author uses rhetoric.' },
      { code: 'CCSS.ELA-9-10.W.1', description: 'Write arguments to support claims in an analysis of substantive topics or texts.' },
      { code: 'CCSS.ELA-9-10.W.3', description: 'Write narratives to develop real or imagined experiences or events.' },
      { code: 'CCSS.ELA-9-10.L.3', description: 'Apply knowledge of language to understand how language functions in different contexts.' },
    ],
    '11-12': [
      { code: 'CCSS.ELA-11-12.RL.2', description: 'Determine two or more themes or central ideas of a text and analyze their development.' },
      { code: 'CCSS.ELA-11-12.RI.7', description: 'Integrate and evaluate multiple sources of information presented in different media or formats.' },
      { code: 'CCSS.ELA-11-12.W.1', description: 'Write arguments to support claims in an analysis of substantive topics or texts.' },
      { code: 'CCSS.ELA-11-12.W.2', description: 'Write informative/explanatory texts to examine and convey complex ideas.' },
      { code: 'CCSS.ELA-11-12.SL.1', description: 'Initiate and participate effectively in a range of collaborative discussions.' },
    ],
  },
  // Common Core Math
  Math: {
    'K': [
      { code: 'CCSS.MATH-K.CC.1', description: 'Count to 100 by ones and by tens.' },
      { code: 'CCSS.MATH-K.CC.4', description: 'Understand the relationship between numbers and quantities; connect counting to cardinality.' },
      { code: 'CCSS.MATH-K.OA.1', description: 'Represent addition and subtraction with objects, fingers, mental images, drawings.' },
      { code: 'CCSS.MATH-K.NBT.1', description: 'Compose and decompose numbers from 11 to 19 into ten ones and some further ones.' },
      { code: 'CCSS.MATH-K.MD.1', description: 'Describe measurable attributes of objects.' },
    ],
    '1': [
      { code: 'CCSS.MATH-1.OA.1', description: 'Use addition and subtraction within 20 to solve word problems.' },
      { code: 'CCSS.MATH-1.OA.6', description: 'Add and subtract within 20, demonstrating fluency for addition and subtraction within 10.' },
      { code: 'CCSS.MATH-1.NBT.2', description: 'Understand that the two digits of a two-digit number represent amounts of tens and ones.' },
      { code: 'CCSS.MATH-1.MD.3', description: 'Tell and write time in hours and half-hours using analog and digital clocks.' },
      { code: 'CCSS.MATH-1.G.1', description: 'Distinguish between defining attributes versus non-defining attributes; build and draw shapes.' },
    ],
    '2': [
      { code: 'CCSS.MATH-2.OA.1', description: 'Use addition and subtraction within 100 to solve one- and two-step word problems.' },
      { code: 'CCSS.MATH-2.NBT.1', description: 'Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones.' },
      { code: 'CCSS.MATH-2.NBT.5', description: 'Fluently add and subtract within 100 using strategies based on place value.' },
      { code: 'CCSS.MATH-2.MD.1', description: 'Measure the length of an object by selecting and using appropriate tools.' },
      { code: 'CCSS.MATH-2.G.1', description: 'Recognize and draw shapes having specified attributes.' },
    ],
    '3': [
      { code: 'CCSS.MATH-3.OA.1', description: 'Interpret products of whole numbers, e.g., interpret 5 × 7 as the total number of objects.' },
      { code: 'CCSS.MATH-3.OA.7', description: 'Fluently multiply and divide within 100.' },
      { code: 'CCSS.MATH-3.NF.1', description: 'Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts.' },
      { code: 'CCSS.MATH-3.MD.3', description: 'Draw a scaled picture graph and a scaled bar graph to represent a data set.' },
      { code: 'CCSS.MATH-3.G.1', description: 'Understand that shapes in different categories may share attributes.' },
    ],
    '4': [
      { code: 'CCSS.MATH-4.OA.1', description: 'Interpret a multiplication equation as a comparison.' },
      { code: 'CCSS.MATH-4.NBT.5', description: 'Multiply a whole number of up to four digits by a one-digit whole number.' },
      { code: 'CCSS.MATH-4.NF.1', description: 'Explain why a fraction a/b is equivalent to a fraction (n×a)/(n×b).' },
      { code: 'CCSS.MATH-4.MD.1', description: 'Know relative sizes of measurement units within one system of units.' },
      { code: 'CCSS.MATH-4.G.2', description: 'Classify two-dimensional figures based on the presence or absence of parallel or perpendicular lines.' },
    ],
    '5': [
      { code: 'CCSS.MATH-5.OA.1', description: 'Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions.' },
      { code: 'CCSS.MATH-5.NBT.1', description: 'Recognize that in a multi-digit number, a digit in one place represents 10 times as much as in the place to its right.' },
      { code: 'CCSS.MATH-5.NF.1', description: 'Add and subtract fractions with unlike denominators.' },
      { code: 'CCSS.MATH-5.MD.1', description: 'Convert among different-sized standard measurement units.' },
      { code: 'CCSS.MATH-5.G.1', description: 'Use a pair of perpendicular number lines, called axes, to define a coordinate system.' },
    ],
    '6': [
      { code: 'CCSS.MATH-6.RP.1', description: 'Understand the concept of a ratio and use ratio language to describe a ratio relationship.' },
      { code: 'CCSS.MATH-6.NS.1', description: 'Interpret and compute quotients of fractions, and solve word problems involving division of fractions.' },
      { code: 'CCSS.MATH-6.EE.1', description: 'Write and evaluate numerical expressions involving whole-number exponents.' },
      { code: 'CCSS.MATH-6.EE.7', description: 'Solve real-world and mathematical problems by writing and solving equations.' },
      { code: 'CCSS.MATH-6.SP.1', description: 'Recognize a statistical question as one that anticipates variability in the data.' },
    ],
    '7': [
      { code: 'CCSS.MATH-7.RP.1', description: 'Compute unit rates associated with ratios of fractions.' },
      { code: 'CCSS.MATH-7.NS.1', description: 'Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers.' },
      { code: 'CCSS.MATH-7.EE.1', description: 'Apply properties of operations to add, subtract, factor, and expand linear expressions.' },
      { code: 'CCSS.MATH-7.G.1', description: 'Solve problems involving scale drawings of geometric figures.' },
      { code: 'CCSS.MATH-7.SP.1', description: 'Understand that statistics can be used to gain information about a population.' },
    ],
    '8': [
      { code: 'CCSS.MATH-8.NS.1', description: 'Know that numbers that are not rational are called irrational.' },
      { code: 'CCSS.MATH-8.EE.1', description: 'Know and apply the properties of integer exponents to generate equivalent numerical expressions.' },
      { code: 'CCSS.MATH-8.F.1', description: 'Understand that a function is a rule that assigns to each input exactly one output.' },
      { code: 'CCSS.MATH-8.G.7', description: 'Apply the Pythagorean Theorem to determine unknown side lengths in right triangles.' },
      { code: 'CCSS.MATH-8.SP.1', description: 'Construct and interpret scatter plots for bivariate measurement data.' },
    ],
    'Algebra I': [
      { code: 'CA-ALG1.N-RN.1', description: 'Explain how the definition of the meaning of rational exponents follows from extending the properties of integer exponents.' },
      { code: 'CA-ALG1.A-SSE.1', description: 'Interpret expressions that represent a quantity in terms of its context.' },
      { code: 'CA-ALG1.A-REI.3', description: 'Solve linear equations and inequalities in one variable.' },
      { code: 'CA-ALG1.F-IF.1', description: 'Understand that a function from one set to another set assigns to each element of the domain exactly one element of the range.' },
      { code: 'CA-ALG1.S-ID.7', description: 'Interpret the slope (rate of change) and the intercept (constant term) of a linear model.' },
    ],
    'Geometry': [
      { code: 'CA-GEO.G-CO.1', description: 'Know precise definitions of angle, circle, perpendicular line, parallel line, and line segment.' },
      { code: 'CA-GEO.G-CO.9', description: 'Prove theorems about lines and angles.' },
      { code: 'CA-GEO.G-SRT.1', description: 'Verify experimentally the properties of dilations given by a center and a scale factor.' },
      { code: 'CA-GEO.G-GPE.5', description: 'Prove the slope criteria for parallel and perpendicular lines and use them to solve problems.' },
      { code: 'CA-GEO.G-MG.1', description: 'Use geometric shapes, their measures, and their properties to describe objects.' },
    ],
    'Algebra II': [
      { code: 'CA-ALG2.N-CN.1', description: 'Know there is a complex number i such that i² = −1, and every complex number has the form a + bi.' },
      { code: 'CA-ALG2.A-APR.2', description: 'Know and apply the Remainder Theorem.' },
      { code: 'CA-ALG2.A-REI.11', description: 'Explain why the x-coordinates of the points where the graphs of two equations intersect are the solutions.' },
      { code: 'CA-ALG2.F-TF.5', description: 'Choose trigonometric functions to model periodic phenomena with specified amplitude, frequency, and midline.' },
      { code: 'CA-ALG2.S-IC.1', description: 'Understand statistics as a process for making inferences about population parameters.' },
    ],
  },
  // California Science (NGSS)
  Science: {
    'K': [
      { code: 'NGSS-K.PS1-1', description: 'Plan and conduct an investigation to describe and classify different kinds of materials by their observable properties.' },
      { code: 'NGSS-K.LS1-1', description: 'Use observations to describe patterns of what plants and animals need to survive.' },
      { code: 'NGSS-K.ESS2-1', description: 'Use and share observations of local weather conditions to describe patterns over time.' },
      { code: 'NGSS-K.ETS1-1', description: 'Ask questions, make observations, and gather information about a situation people want to change to define a simple problem.' },
    ],
    '1': [
      { code: 'NGSS-1.LS1-1', description: 'Use materials to design a solution to a human problem by mimicking how plants and/or animals use their external parts to help them survive, grow, and meet their needs.' },
      { code: 'NGSS-1.LS3-1', description: 'Make observations to construct an evidence-based account that young plants and animals are like, but not exactly like, their parents.' },
      { code: 'NGSS-1.ESS1-1', description: 'Use observations of the sun, moon, and stars to describe patterns that can be predicted.' },
    ],
    '3': [
      { code: 'NGSS-3.LS1-1', description: 'Develop models to describe that organisms have unique and diverse life cycles but all have in common birth, growth, reproduction, and death.' },
      { code: 'NGSS-3.LS4-3', description: 'Construct an argument with evidence that in a particular habitat some organisms can survive well, some survive less well, and some cannot survive at all.' },
      { code: 'NGSS-3.ESS2-1', description: 'Represent data in tables and graphical displays to describe typical weather conditions expected during a particular season.' },
      { code: 'NGSS-3.ETS1-1', description: 'Define a simple design problem reflecting a need or want that includes specified criteria for success and constraints on materials, time, or cost.' },
    ],
    '5': [
      { code: 'NGSS-5.PS1-1', description: 'Develop a model to describe that matter is made of particles too small to be seen.' },
      { code: 'NGSS-5.PS3-1', description: 'Use models to describe that energy in animals\' food was once energy from the sun.' },
      { code: 'NGSS-5.LS2-1', description: 'Develop a model to describe the movement of matter among plants, animals, decomposers, and the environment.' },
      { code: 'NGSS-5.ESS1-1', description: 'Support an argument that the apparent brightness of the sun and stars is due to their relative distances from Earth.' },
    ],
    'Middle School': [
      { code: 'NGSS-MS.PS1-1', description: 'Develop models to describe the atomic composition of simple molecules and extended structures.' },
      { code: 'NGSS-MS.LS1-1', description: 'Conduct an investigation to provide evidence that living things are made of cells.' },
      { code: 'NGSS-MS.ESS1-1', description: 'Develop and use a model of the Earth-sun-moon system to describe the cyclic patterns of lunar phases, eclipses of the sun and moon, and seasons.' },
      { code: 'NGSS-MS.ETS1-1', description: 'Define the criteria and constraints of a design problem with sufficient precision to ensure a successful solution.' },
    ],
    'High School Biology': [
      { code: 'NGSS-HS.LS1-1', description: 'Construct an explanation based on evidence for how the structure of DNA determines the structure of proteins.' },
      { code: 'NGSS-HS.LS2-2', description: 'Use mathematical representations to support and revise explanations based on evidence about factors affecting biodiversity and populations in ecosystems.' },
      { code: 'NGSS-HS.LS3-1', description: 'Ask questions to clarify relationships about the role of DNA and chromosomes in coding the instructions for characteristic traits passed from parents to offspring.' },
    ],
    'High School Chemistry': [
      { code: 'NGSS-HS.PS1-1', description: 'Use the periodic table as a model to predict the relative properties of elements based on the patterns of electrons in the outermost energy level.' },
      { code: 'NGSS-HS.PS1-7', description: 'Use mathematical representations to support the claim that atoms, and therefore mass, are conserved during a chemical reaction.' },
      { code: 'NGSS-HS.PS3-1', description: 'Create a computational model to calculate the change in the energy of one component in a system when the change in energy of the other component(s) and energy flows in and out of the system are known.' },
    ],
    'High School Physics': [
      { code: 'NGSS-HS.PS2-1', description: 'Analyze data to support the claim that Newton\'s second law of motion describes the mathematical relationship among the net force on a macroscopic object, its mass, and its acceleration.' },
      { code: 'NGSS-HS.PS3-3', description: 'Design, build, and refine a device that works within given constraints to convert one form of energy into another form of energy.' },
      { code: 'NGSS-HS.ESS1-4', description: 'Use mathematical or computational representations to predict the motion of orbiting objects in the solar system.' },
    ],
  },
  // California History-Social Science
  'History-Social Science': {
    '2': [
      { code: 'CA-HSS-2.1', description: 'Students demonstrate map skills by describing the absolute and relative locations of people, places, and environments.' },
      { code: 'CA-HSS-2.4', description: 'Students understand basic economic concepts and the role of individual choice in a free-market economy.' },
    ],
    '4': [
      { code: 'CA-HSS-4.1', description: 'Students demonstrate an understanding of the physical and human geographic features that define places and regions in California.' },
      { code: 'CA-HSS-4.3', description: 'Students explain the economic, social, and political life in California from the establishment of the Bear Flag Republic through the Mexican-American War.' },
      { code: 'CA-HSS-4.4', description: 'Students explain how California became an agricultural and industrial power.' },
    ],
    '5': [
      { code: 'CA-HSS-5.1', description: 'Students describe the major pre-Columbian settlements, including the cliff dwellers and pueblo people of the desert Southwest.' },
      { code: 'CA-HSS-5.3', description: 'Students describe the cooperation and conflict that existed among the American Indians and between the Indian nations and the new settlers.' },
      { code: 'CA-HSS-5.7', description: 'Students describe the causes and effects of the American Revolution with a focus on the Declaration of Independence.' },
    ],
    '8': [
      { code: 'CA-HSS-8.1', description: 'Students understand the major events preceding the founding of the nation and relating to the development of American constitutional democracy.' },
      { code: 'CA-HSS-8.10', description: 'Students analyze the multiple causes, key events, and complex consequences of the Civil War.' },
      { code: 'CA-HSS-8.12', description: 'Students analyze the transformation of the American economy and the changing social and political conditions in the United States in response to the Industrial Revolution.' },
    ],
    '10': [
      { code: 'CA-HSS-10.1', description: 'Students relate the moral and ethical principles in ancient Greek and Roman philosophy, in Judaism, and in Christianity to the development of Western political thought.' },
      { code: 'CA-HSS-10.6', description: 'Students analyze the effects of the First World War.' },
      { code: 'CA-HSS-10.9', description: 'Students analyze the international developments in the post-World War II world.' },
    ],
    '11': [
      { code: 'CA-HSS-11.1', description: 'Students analyze the significant events in the founding of the nation and its attempts to realize the philosophy of government described in the Declaration of Independence.' },
      { code: 'CA-HSS-11.7', description: 'Students analyze America\'s participation in World War II.' },
      { code: 'CA-HSS-11.11', description: 'Students analyze the major social problems and domestic policy issues in contemporary American society.' },
    ],
  },
};

function getStandardsForGradeSubject(grade, subject) {
  // Normalize inputs
  const subjectMap = {
    'english': 'ELA', 'english language arts': 'ELA', 'ela': 'ELA', 'reading': 'ELA', 'writing': 'ELA',
    'math': 'Math', 'mathematics': 'Math', 'algebra': 'Math', 'algebra i': 'Math', 'algebra ii': 'Math',
    'geometry': 'Math', 'calculus': 'Math', 'statistics': 'Math',
    'science': 'Science', 'biology': 'Science', 'chemistry': 'Science', 'physics': 'Science',
    'earth science': 'Science', 'life science': 'Science', 'physical science': 'Science',
    'history': 'History-Social Science', 'social science': 'History-Social Science',
    'social studies': 'History-Social Science', 'civics': 'History-Social Science',
    'economics': 'History-Social Science',
  };

  const gradeMap = {
    'kindergarten': 'K', 'k': 'K',
    '1st': '1', '2nd': '2', '3rd': '3', '4th': '4', '5th': '5',
    '6th': '6', '7th': '7', '8th': '8',
    '9th': '9-10', '10th': '9-10', '9': '9-10', '10': '9-10',
    '11th': '11-12', '12th': '11-12', '11': '11-12', '12': '11-12',
    'middle school': 'Middle School',
    'high school': 'High School Biology',
  };

  const subjectKey = subjectMap[subject?.toLowerCase()] || 'ELA';
  const gradeKey = gradeMap[grade?.toLowerCase()] || grade;

  const subjectStandards = CA_STANDARDS[subjectKey] || CA_STANDARDS['ELA'];

  // Try exact match first, then fallback
  if (subjectStandards[gradeKey]) return subjectStandards[gradeKey];

  // Return first available grade's standards as fallback
  const firstKey = Object.keys(subjectStandards)[0];
  return subjectStandards[firstKey] || [];
}

module.exports = { CA_STANDARDS, getStandardsForGradeSubject };
