import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GENRES = [
  "Personal Development",
  "Productivity",
  "Business & Entrepreneurship",
  "Psychology & Mindset",
  "Money & Finance",
  "Leadership",
  "Health & Wellness",
  "Communication",
  "Relationships",
  "Career & Success",
  "Creativity",
  "Science & Technology",
  "Philosophy",
  "History",
  "Parenting & Education",
];

interface BookData {
  title: string;
  author: string;
  genres: string[];
  description: string;
  duration: number;
}

const BOOKS: BookData[] = [
  // Personal Development
  { title: "Atomic Habits", author: "James Clear", genres: ["Personal Development", "Productivity"], description: "An easy and proven way to build good habits and break bad ones.", duration: 15 },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", genres: ["Personal Development", "Leadership"], description: "Powerful lessons in personal change.", duration: 18 },
  { title: "Think and Grow Rich", author: "Napoleon Hill", genres: ["Personal Development", "Money & Finance"], description: "The landmark bestseller on achieving success.", duration: 15 },
  { title: "The Power of Now", author: "Eckhart Tolle", genres: ["Personal Development", "Philosophy"], description: "A guide to spiritual enlightenment.", duration: 12 },
  { title: "Mindset: The New Psychology of Success", author: "Carol S. Dweck", genres: ["Personal Development", "Psychology & Mindset"], description: "Discover how a simple idea about the brain can create a love of learning.", duration: 15 },
  { title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", genres: ["Personal Development", "Philosophy"], description: "A counterintuitive approach to living a good life.", duration: 13 },
  { title: "Can't Hurt Me", author: "David Goggins", genres: ["Personal Development", "Health & Wellness"], description: "Master your mind and defy the odds.", duration: 18 },
  { title: "The Four Agreements", author: "Don Miguel Ruiz", genres: ["Personal Development", "Philosophy"], description: "A practical guide to personal freedom.", duration: 10 },
  { title: "Man's Search for Meaning", author: "Viktor E. Frankl", genres: ["Personal Development", "Philosophy"], description: "A psychiatrist's experience in Nazi death camps.", duration: 12 },
  { title: "Awaken the Giant Within", author: "Tony Robbins", genres: ["Personal Development", "Psychology & Mindset"], description: "How to take immediate control of your mental, emotional, physical and financial destiny.", duration: 20 },
  { title: "The Miracle Morning", author: "Hal Elrod", genres: ["Personal Development", "Productivity"], description: "The not-so-obvious secret guaranteed to transform your life.", duration: 12 },
  { title: "Grit", author: "Angela Duckworth", genres: ["Personal Development", "Psychology & Mindset"], description: "The power of passion and perseverance.", duration: 14 },
  { title: "The 5 AM Club", author: "Robin Sharma", genres: ["Personal Development", "Productivity"], description: "Own your morning, elevate your life.", duration: 16 },
  { title: "You Are a Badass", author: "Jen Sincero", genres: ["Personal Development", "Psychology & Mindset"], description: "How to stop doubting your greatness and start living an awesome life.", duration: 13 },
  { title: "The Gifts of Imperfection", author: "Brené Brown", genres: ["Personal Development", "Psychology & Mindset"], description: "Let go of who you think you're supposed to be and embrace who you are.", duration: 11 },
  { title: "Daring Greatly", author: "Brené Brown", genres: ["Personal Development", "Psychology & Mindset"], description: "How the courage to be vulnerable transforms the way we live, love, parent, and lead.", duration: 14 },
  { title: "The Compound Effect", author: "Darren Hardy", genres: ["Personal Development", "Productivity"], description: "Jumpstart your income, your life, your success.", duration: 10 },
  { title: "Tiny Habits", author: "BJ Fogg", genres: ["Personal Development", "Psychology & Mindset"], description: "The small changes that change everything.", duration: 14 },
  { title: "12 Rules for Life", author: "Jordan B. Peterson", genres: ["Personal Development", "Philosophy"], description: "An antidote to chaos.", duration: 18 },
  { title: "The Mountain Is You", author: "Brianna Wiest", genres: ["Personal Development", "Psychology & Mindset"], description: "Transforming self-sabotage into self-mastery.", duration: 12 },
  
  // Productivity
  { title: "Deep Work", author: "Cal Newport", genres: ["Productivity", "Career & Success"], description: "Rules for focused success in a distracted world.", duration: 14 },
  { title: "Getting Things Done", author: "David Allen", genres: ["Productivity", "Business & Entrepreneurship"], description: "The art of stress-free productivity.", duration: 15 },
  { title: "Essentialism", author: "Greg McKeown", genres: ["Productivity", "Personal Development"], description: "The disciplined pursuit of less.", duration: 13 },
  { title: "The One Thing", author: "Gary Keller", genres: ["Productivity", "Business & Entrepreneurship"], description: "The surprisingly simple truth behind extraordinary results.", duration: 12 },
  { title: "Make Time", author: "Jake Knapp", genres: ["Productivity", "Personal Development"], description: "How to focus on what matters every day.", duration: 11 },
  { title: "Indistractable", author: "Nir Eyal", genres: ["Productivity", "Psychology & Mindset"], description: "How to control your attention and choose your life.", duration: 13 },
  { title: "Eat That Frog!", author: "Brian Tracy", genres: ["Productivity", "Career & Success"], description: "21 great ways to stop procrastinating and get more done in less time.", duration: 8 },
  { title: "The 4-Hour Workweek", author: "Tim Ferriss", genres: ["Productivity", "Business & Entrepreneurship"], description: "Escape 9-5, live anywhere, and join the new rich.", duration: 16 },
  { title: "Digital Minimalism", author: "Cal Newport", genres: ["Productivity", "Personal Development"], description: "Choosing a focused life in a noisy world.", duration: 13 },
  { title: "The War of Art", author: "Steven Pressfield", genres: ["Productivity", "Creativity"], description: "Break through the blocks and win your inner creative battles.", duration: 9 },
  { title: "Flow", author: "Mihaly Csikszentmihalyi", genres: ["Productivity", "Psychology & Mindset"], description: "The psychology of optimal experience.", duration: 15 },
  { title: "168 Hours", author: "Laura Vanderkam", genres: ["Productivity", "Career & Success"], description: "You have more time than you think.", duration: 12 },
  { title: "The Now Habit", author: "Neil Fiore", genres: ["Productivity", "Psychology & Mindset"], description: "A strategic program for overcoming procrastination.", duration: 11 },
  { title: "Hyperfocus", author: "Chris Bailey", genres: ["Productivity", "Psychology & Mindset"], description: "How to be more productive in a world of distraction.", duration: 13 },
  { title: "Rest", author: "Alex Soojung-Kim Pang", genres: ["Productivity", "Health & Wellness"], description: "Why you get more done when you work less.", duration: 12 },
  
  // Business & Entrepreneurship
  { title: "Zero to One", author: "Peter Thiel", genres: ["Business & Entrepreneurship", "Leadership"], description: "Notes on startups, or how to build the future.", duration: 12 },
  { title: "The Lean Startup", author: "Eric Ries", genres: ["Business & Entrepreneurship", "Productivity"], description: "How today's entrepreneurs use continuous innovation.", duration: 14 },
  { title: "Good to Great", author: "Jim Collins", genres: ["Business & Entrepreneurship", "Leadership"], description: "Why some companies make the leap and others don't.", duration: 15 },
  { title: "Start with Why", author: "Simon Sinek", genres: ["Business & Entrepreneurship", "Leadership"], description: "How great leaders inspire everyone to take action.", duration: 13 },
  { title: "The E-Myth Revisited", author: "Michael E. Gerber", genres: ["Business & Entrepreneurship", "Leadership"], description: "Why most small businesses don't work and what to do about it.", duration: 14 },
  { title: "Built to Last", author: "Jim Collins", genres: ["Business & Entrepreneurship", "Leadership"], description: "Successful habits of visionary companies.", duration: 16 },
  { title: "Rework", author: "Jason Fried", genres: ["Business & Entrepreneurship", "Productivity"], description: "Change the way you work forever.", duration: 10 },
  { title: "The Hard Thing About Hard Things", author: "Ben Horowitz", genres: ["Business & Entrepreneurship", "Leadership"], description: "Building a business when there are no easy answers.", duration: 14 },
  { title: "Shoe Dog", author: "Phil Knight", genres: ["Business & Entrepreneurship", "Personal Development"], description: "A memoir by the creator of Nike.", duration: 16 },
  { title: "The $100 Startup", author: "Chris Guillebeau", genres: ["Business & Entrepreneurship", "Money & Finance"], description: "Reinvent the way you make a living.", duration: 12 },
  { title: "Profit First", author: "Mike Michalowicz", genres: ["Business & Entrepreneurship", "Money & Finance"], description: "Transform your business from a cash-eating monster to a money-making machine.", duration: 13 },
  { title: "Company of One", author: "Paul Jarvis", genres: ["Business & Entrepreneurship", "Career & Success"], description: "Why staying small is the next big thing for business.", duration: 12 },
  { title: "Traction", author: "Gino Wickman", genres: ["Business & Entrepreneurship", "Leadership"], description: "Get a grip on your business.", duration: 11 },
  { title: "The Mom Test", author: "Rob Fitzpatrick", genres: ["Business & Entrepreneurship", "Communication"], description: "How to talk to customers and learn if your business is a good idea.", duration: 8 },
  { title: "Blitzscaling", author: "Reid Hoffman", genres: ["Business & Entrepreneurship", "Leadership"], description: "The lightning-fast path to building massively valuable companies.", duration: 14 },
  { title: "Blue Ocean Strategy", author: "W. Chan Kim", genres: ["Business & Entrepreneurship", "Leadership"], description: "How to create uncontested market space and make the competition irrelevant.", duration: 15 },
  { title: "The Innovator's Dilemma", author: "Clayton M. Christensen", genres: ["Business & Entrepreneurship", "Science & Technology"], description: "When new technologies cause great firms to fail.", duration: 14 },
  { title: "Delivering Happiness", author: "Tony Hsieh", genres: ["Business & Entrepreneurship", "Leadership"], description: "A path to profits, passion, and purpose.", duration: 13 },
  { title: "Creativity, Inc.", author: "Ed Catmull", genres: ["Business & Entrepreneurship", "Creativity"], description: "Overcoming the unseen forces that stand in the way of true inspiration.", duration: 15 },
  { title: "The Personal MBA", author: "Josh Kaufman", genres: ["Business & Entrepreneurship", "Career & Success"], description: "Master the art of business.", duration: 16 },
  
  // Psychology & Mindset
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genres: ["Psychology & Mindset", "Science & Technology"], description: "How we think and make choices.", duration: 18 },
  { title: "Influence", author: "Robert B. Cialdini", genres: ["Psychology & Mindset", "Communication"], description: "The psychology of persuasion.", duration: 14 },
  { title: "Predictably Irrational", author: "Dan Ariely", genres: ["Psychology & Mindset", "Money & Finance"], description: "The hidden forces that shape our decisions.", duration: 13 },
  { title: "The Power of Habit", author: "Charles Duhigg", genres: ["Psychology & Mindset", "Personal Development"], description: "Why we do what we do in life and business.", duration: 14 },
  { title: "Emotional Intelligence", author: "Daniel Goleman", genres: ["Psychology & Mindset", "Leadership"], description: "Why it can matter more than IQ.", duration: 15 },
  { title: "Drive", author: "Daniel H. Pink", genres: ["Psychology & Mindset", "Leadership"], description: "The surprising truth about what motivates us.", duration: 12 },
  { title: "Stumbling on Happiness", author: "Daniel Gilbert", genres: ["Psychology & Mindset", "Philosophy"], description: "Why we don't know what makes us happy.", duration: 13 },
  { title: "The Happiness Hypothesis", author: "Jonathan Haidt", genres: ["Psychology & Mindset", "Philosophy"], description: "Finding modern truth in ancient wisdom.", duration: 14 },
  { title: "Blink", author: "Malcolm Gladwell", genres: ["Psychology & Mindset", "Personal Development"], description: "The power of thinking without thinking.", duration: 11 },
  { title: "Outliers", author: "Malcolm Gladwell", genres: ["Psychology & Mindset", "Career & Success"], description: "The story of success.", duration: 12 },
  { title: "The Tipping Point", author: "Malcolm Gladwell", genres: ["Psychology & Mindset", "Business & Entrepreneurship"], description: "How little things can make a big difference.", duration: 11 },
  { title: "Quiet", author: "Susan Cain", genres: ["Psychology & Mindset", "Personal Development"], description: "The power of introverts in a world that can't stop talking.", duration: 14 },
  { title: "The Willpower Instinct", author: "Kelly McGonigal", genres: ["Psychology & Mindset", "Health & Wellness"], description: "How self-control works, why it matters, and what you can do to get more of it.", duration: 13 },
  { title: "Attached", author: "Amir Levine", genres: ["Psychology & Mindset", "Relationships"], description: "The new science of adult attachment.", duration: 12 },
  { title: "The Body Keeps the Score", author: "Bessel van der Kolk", genres: ["Psychology & Mindset", "Health & Wellness"], description: "Brain, mind, and body in the healing of trauma.", duration: 16 },
  { title: "Never Split the Difference", author: "Chris Voss", genres: ["Psychology & Mindset", "Communication"], description: "Negotiating as if your life depended on it.", duration: 13 },
  { title: "Fooled by Randomness", author: "Nassim Nicholas Taleb", genres: ["Psychology & Mindset", "Money & Finance"], description: "The hidden role of chance in life and in the markets.", duration: 14 },
  { title: "The Paradox of Choice", author: "Barry Schwartz", genres: ["Psychology & Mindset", "Personal Development"], description: "Why more is less.", duration: 11 },
  { title: "Sapiens", author: "Yuval Noah Harari", genres: ["Psychology & Mindset", "History"], description: "A brief history of humankind.", duration: 18 },
  { title: "21 Lessons for the 21st Century", author: "Yuval Noah Harari", genres: ["Psychology & Mindset", "Philosophy"], description: "What it means to be human in an age of bewilderment.", duration: 15 },
  
  // Money & Finance
  { title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", genres: ["Money & Finance", "Personal Development"], description: "What the rich teach their kids about money.", duration: 12 },
  { title: "The Psychology of Money", author: "Morgan Housel", genres: ["Money & Finance", "Psychology & Mindset"], description: "Timeless lessons on wealth, greed, and happiness.", duration: 13 },
  { title: "I Will Teach You to Be Rich", author: "Ramit Sethi", genres: ["Money & Finance", "Personal Development"], description: "No guilt. No excuses. No BS. Just a 6-week program that works.", duration: 14 },
  { title: "The Millionaire Next Door", author: "Thomas J. Stanley", genres: ["Money & Finance", "Personal Development"], description: "The surprising secrets of America's wealthy.", duration: 13 },
  { title: "The Total Money Makeover", author: "Dave Ramsey", genres: ["Money & Finance", "Personal Development"], description: "A proven plan for financial fitness.", duration: 12 },
  { title: "The Intelligent Investor", author: "Benjamin Graham", genres: ["Money & Finance", "Business & Entrepreneurship"], description: "The definitive book on value investing.", duration: 18 },
  { title: "A Random Walk Down Wall Street", author: "Burton G. Malkiel", genres: ["Money & Finance", "Science & Technology"], description: "The time-tested strategy for successful investing.", duration: 16 },
  { title: "The Simple Path to Wealth", author: "JL Collins", genres: ["Money & Finance", "Personal Development"], description: "Your road map to financial independence.", duration: 12 },
  { title: "Your Money or Your Life", author: "Vicki Robin", genres: ["Money & Finance", "Personal Development"], description: "9 steps to transforming your relationship with money.", duration: 14 },
  { title: "The Richest Man in Babylon", author: "George S. Clason", genres: ["Money & Finance", "Personal Development"], description: "The success secrets of the ancients.", duration: 9 },
  { title: "Die with Zero", author: "Bill Perkins", genres: ["Money & Finance", "Philosophy"], description: "Getting all you can from your money and your life.", duration: 12 },
  { title: "Money: Master the Game", author: "Tony Robbins", genres: ["Money & Finance", "Personal Development"], description: "7 simple steps to financial freedom.", duration: 18 },
  { title: "The Barefoot Investor", author: "Scott Pape", genres: ["Money & Finance", "Personal Development"], description: "The only money guide you'll ever need.", duration: 13 },
  { title: "Set for Life", author: "Scott Trench", genres: ["Money & Finance", "Career & Success"], description: "Dominate life, money, and the American dream.", duration: 12 },
  { title: "Financial Freedom", author: "Grant Sabatier", genres: ["Money & Finance", "Personal Development"], description: "A proven path to all the money you will ever need.", duration: 14 },
  
  // Leadership
  { title: "Leaders Eat Last", author: "Simon Sinek", genres: ["Leadership", "Business & Entrepreneurship"], description: "Why some teams pull together and others don't.", duration: 14 },
  { title: "The 21 Irrefutable Laws of Leadership", author: "John C. Maxwell", genres: ["Leadership", "Personal Development"], description: "Follow them and people will follow you.", duration: 13 },
  { title: "Extreme Ownership", author: "Jocko Willink", genres: ["Leadership", "Personal Development"], description: "How U.S. Navy SEALs lead and win.", duration: 14 },
  { title: "Dare to Lead", author: "Brené Brown", genres: ["Leadership", "Psychology & Mindset"], description: "Brave work. Tough conversations. Whole hearts.", duration: 13 },
  { title: "The Five Dysfunctions of a Team", author: "Patrick Lencioni", genres: ["Leadership", "Business & Entrepreneurship"], description: "A leadership fable.", duration: 10 },
  { title: "Primal Leadership", author: "Daniel Goleman", genres: ["Leadership", "Psychology & Mindset"], description: "Unleashing the power of emotional intelligence.", duration: 14 },
  { title: "Turn the Ship Around!", author: "L. David Marquet", genres: ["Leadership", "Business & Entrepreneurship"], description: "A true story of turning followers into leaders.", duration: 12 },
  { title: "Multipliers", author: "Liz Wiseman", genres: ["Leadership", "Business & Entrepreneurship"], description: "How the best leaders make everyone smarter.", duration: 13 },
  { title: "The Culture Code", author: "Daniel Coyle", genres: ["Leadership", "Business & Entrepreneurship"], description: "The secrets of highly successful groups.", duration: 13 },
  { title: "Radical Candor", author: "Kim Scott", genres: ["Leadership", "Communication"], description: "Be a kick-ass boss without losing your humanity.", duration: 14 },
  { title: "The Servant", author: "James C. Hunter", genres: ["Leadership", "Personal Development"], description: "A simple story about the true essence of leadership.", duration: 10 },
  { title: "It's Your Ship", author: "Captain D. Michael Abrashoff", genres: ["Leadership", "Business & Entrepreneurship"], description: "Management techniques from the best damn ship in the Navy.", duration: 12 },
  { title: "The New One Minute Manager", author: "Ken Blanchard", genres: ["Leadership", "Business & Entrepreneurship"], description: "Increase productivity, profits, and your own prosperity.", duration: 8 },
  { title: "Tribal Leadership", author: "Dave Logan", genres: ["Leadership", "Business & Entrepreneurship"], description: "Leveraging natural groups to build a thriving organization.", duration: 13 },
  { title: "Measure What Matters", author: "John Doerr", genres: ["Leadership", "Business & Entrepreneurship"], description: "How Google, Bono, and the Gates Foundation rock the world with OKRs.", duration: 14 },
  
  // Health & Wellness
  { title: "Why We Sleep", author: "Matthew Walker", genres: ["Health & Wellness", "Science & Technology"], description: "Unlocking the power of sleep and dreams.", duration: 15 },
  { title: "The 4-Hour Body", author: "Tim Ferriss", genres: ["Health & Wellness", "Personal Development"], description: "An uncommon guide to rapid fat-loss, incredible sex, and becoming superhuman.", duration: 18 },
  { title: "Breath", author: "James Nestor", genres: ["Health & Wellness", "Science & Technology"], description: "The new science of a lost art.", duration: 13 },
  { title: "Lifespan", author: "David A. Sinclair", genres: ["Health & Wellness", "Science & Technology"], description: "Why we age—and why we don't have to.", duration: 15 },
  { title: "The Obesity Code", author: "Dr. Jason Fung", genres: ["Health & Wellness", "Science & Technology"], description: "Unlocking the secrets of weight loss.", duration: 14 },
  { title: "How Not to Die", author: "Michael Greger", genres: ["Health & Wellness", "Science & Technology"], description: "Discover the foods scientifically proven to prevent and reverse disease.", duration: 16 },
  { title: "Born to Run", author: "Christopher McDougall", genres: ["Health & Wellness", "Personal Development"], description: "A hidden tribe, superathletes, and the greatest race the world has never seen.", duration: 14 },
  { title: "Spark", author: "John J. Ratey", genres: ["Health & Wellness", "Science & Technology"], description: "The revolutionary new science of exercise and the brain.", duration: 13 },
  { title: "10% Happier", author: "Dan Harris", genres: ["Health & Wellness", "Personal Development"], description: "How I tamed the voice in my head.", duration: 13 },
  { title: "Wherever You Go, There You Are", author: "Jon Kabat-Zinn", genres: ["Health & Wellness", "Philosophy"], description: "Mindfulness meditation in everyday life.", duration: 10 },
  { title: "The Telomere Effect", author: "Elizabeth Blackburn", genres: ["Health & Wellness", "Science & Technology"], description: "A revolutionary approach to living younger, healthier, longer.", duration: 14 },
  { title: "Genius Foods", author: "Max Lugavere", genres: ["Health & Wellness", "Science & Technology"], description: "Become smarter, happier, and more productive while protecting your brain for life.", duration: 13 },
  { title: "The Longevity Paradox", author: "Steven R. Gundry", genres: ["Health & Wellness", "Science & Technology"], description: "How to die young at a ripe old age.", duration: 13 },
  { title: "In Defense of Food", author: "Michael Pollan", genres: ["Health & Wellness", "Science & Technology"], description: "An eater's manifesto.", duration: 11 },
  { title: "Boundless", author: "Ben Greenfield", genres: ["Health & Wellness", "Personal Development"], description: "Upgrade your brain, optimize your body & defy aging.", duration: 18 },
  
  // Communication
  { title: "How to Win Friends and Influence People", author: "Dale Carnegie", genres: ["Communication", "Personal Development"], description: "The only book you need to lead you to success.", duration: 14 },
  { title: "Crucial Conversations", author: "Kerry Patterson", genres: ["Communication", "Leadership"], description: "Tools for talking when stakes are high.", duration: 13 },
  { title: "Nonviolent Communication", author: "Marshall B. Rosenberg", genres: ["Communication", "Relationships"], description: "A language of life.", duration: 12 },
  { title: "Talk Like TED", author: "Carmine Gallo", genres: ["Communication", "Career & Success"], description: "The 9 public-speaking secrets of the world's top minds.", duration: 12 },
  { title: "Made to Stick", author: "Chip Heath", genres: ["Communication", "Business & Entrepreneurship"], description: "Why some ideas survive and others die.", duration: 13 },
  { title: "The Charisma Myth", author: "Olivia Fox Cabane", genres: ["Communication", "Personal Development"], description: "How anyone can master the art and science of personal magnetism.", duration: 12 },
  { title: "Just Listen", author: "Mark Goulston", genres: ["Communication", "Relationships"], description: "Discover the secret to getting through to absolutely anyone.", duration: 11 },
  { title: "Thanks for the Feedback", author: "Douglas Stone", genres: ["Communication", "Leadership"], description: "The science and art of receiving feedback well.", duration: 13 },
  { title: "Difficult Conversations", author: "Douglas Stone", genres: ["Communication", "Relationships"], description: "How to discuss what matters most.", duration: 14 },
  { title: "The Fine Art of Small Talk", author: "Debra Fine", genres: ["Communication", "Personal Development"], description: "How to start a conversation, keep it going, build networking skills.", duration: 10 },
  { title: "Simply Said", author: "Jay Sullivan", genres: ["Communication", "Career & Success"], description: "Communicating better at work and beyond.", duration: 12 },
  { title: "Resonate", author: "Nancy Duarte", genres: ["Communication", "Business & Entrepreneurship"], description: "Present visual stories that transform audiences.", duration: 11 },
  { title: "On Writing Well", author: "William Zinsser", genres: ["Communication", "Creativity"], description: "The classic guide to writing nonfiction.", duration: 13 },
  { title: "Everybody Writes", author: "Ann Handley", genres: ["Communication", "Business & Entrepreneurship"], description: "Your go-to guide to creating ridiculously good content.", duration: 14 },
  { title: "Storyworthy", author: "Matthew Dicks", genres: ["Communication", "Creativity"], description: "Engage, teach, persuade, and change your life through the power of storytelling.", duration: 13 },
  
  // Relationships
  { title: "The 5 Love Languages", author: "Gary Chapman", genres: ["Relationships", "Communication"], description: "The secret to love that lasts.", duration: 11 },
  { title: "Hold Me Tight", author: "Dr. Sue Johnson", genres: ["Relationships", "Psychology & Mindset"], description: "Seven conversations for a lifetime of love.", duration: 13 },
  { title: "Mating in Captivity", author: "Esther Perel", genres: ["Relationships", "Psychology & Mindset"], description: "Unlocking erotic intelligence.", duration: 12 },
  { title: "The Seven Principles for Making Marriage Work", author: "John M. Gottman", genres: ["Relationships", "Psychology & Mindset"], description: "A practical guide from the country's foremost relationship expert.", duration: 14 },
  { title: "Getting the Love You Want", author: "Harville Hendrix", genres: ["Relationships", "Psychology & Mindset"], description: "A guide for couples.", duration: 13 },
  { title: "Eight Dates", author: "John M. Gottman", genres: ["Relationships", "Communication"], description: "Essential conversations for a lifetime of love.", duration: 11 },
  { title: "Come As You Are", author: "Emily Nagoski", genres: ["Relationships", "Health & Wellness"], description: "The surprising new science that will transform your sex life.", duration: 14 },
  { title: "The State of Affairs", author: "Esther Perel", genres: ["Relationships", "Psychology & Mindset"], description: "Rethinking infidelity.", duration: 13 },
  { title: "Love Sense", author: "Dr. Sue Johnson", genres: ["Relationships", "Science & Technology"], description: "The revolutionary new science of romantic relationships.", duration: 13 },
  { title: "Why Won't You Apologize?", author: "Harriet Lerner", genres: ["Relationships", "Communication"], description: "Healing big betrayals and everyday hurts.", duration: 11 },
  { title: "Not 'Just Friends'", author: "Shirley P. Glass", genres: ["Relationships", "Psychology & Mindset"], description: "Rebuilding trust and recovering your sanity after infidelity.", duration: 14 },
  { title: "Set Boundaries, Find Peace", author: "Nedra Glover Tawwab", genres: ["Relationships", "Personal Development"], description: "A guide to reclaiming yourself.", duration: 12 },
  { title: "All About Love", author: "bell hooks", genres: ["Relationships", "Philosophy"], description: "New visions.", duration: 11 },
  { title: "Men Are from Mars, Women Are from Venus", author: "John Gray", genres: ["Relationships", "Communication"], description: "The classic guide to understanding the opposite sex.", duration: 13 },
  { title: "The Course of Love", author: "Alain de Botton", genres: ["Relationships", "Philosophy"], description: "A novel.", duration: 12 },
  
  // Career & Success
  { title: "So Good They Can't Ignore You", author: "Cal Newport", genres: ["Career & Success", "Personal Development"], description: "Why skills trump passion in the quest for work you love.", duration: 13 },
  { title: "The Lean Career", author: "Chris Guillebeau", genres: ["Career & Success", "Business & Entrepreneurship"], description: "Put yourself in the driver's seat of your career.", duration: 11 },
  { title: "Range", author: "David Epstein", genres: ["Career & Success", "Psychology & Mindset"], description: "Why generalists triumph in a specialized world.", duration: 14 },
  { title: "Peak", author: "Anders Ericsson", genres: ["Career & Success", "Psychology & Mindset"], description: "Secrets from the new science of expertise.", duration: 13 },
  { title: "Mastery", author: "Robert Greene", genres: ["Career & Success", "Psychology & Mindset"], description: "The keys to success and long-term fulfillment.", duration: 16 },
  { title: "The Pathless Path", author: "Paul Millerd", genres: ["Career & Success", "Philosophy"], description: "Imagining a new story for work and life.", duration: 11 },
  { title: "Designing Your Life", author: "Bill Burnett", genres: ["Career & Success", "Personal Development"], description: "How to build a well-lived, joyful life.", duration: 13 },
  { title: "What Color Is Your Parachute?", author: "Richard N. Bolles", genres: ["Career & Success", "Personal Development"], description: "Your guide to a lifetime of meaningful work and career success.", duration: 15 },
  { title: "Show Your Work!", author: "Austin Kleon", genres: ["Career & Success", "Creativity"], description: "10 ways to share your creativity and get discovered.", duration: 8 },
  { title: "The Defining Decade", author: "Meg Jay", genres: ["Career & Success", "Personal Development"], description: "Why your twenties matter—and how to make the most of them now.", duration: 13 },
  { title: "Linchpin", author: "Seth Godin", genres: ["Career & Success", "Personal Development"], description: "Are you indispensable?", duration: 12 },
  { title: "Great at Work", author: "Morten T. Hansen", genres: ["Career & Success", "Productivity"], description: "How top performers do less, work better, and achieve more.", duration: 13 },
  { title: "The Squiggly Career", author: "Helen Tupper", genres: ["Career & Success", "Personal Development"], description: "Ditch the ladder, discover opportunity, design your career.", duration: 11 },
  { title: "Never Eat Alone", author: "Keith Ferrazzi", genres: ["Career & Success", "Communication"], description: "And other secrets to success, one relationship at a time.", duration: 14 },
  { title: "Designing Your Work Life", author: "Bill Burnett", genres: ["Career & Success", "Personal Development"], description: "How to thrive and change and find happiness at work.", duration: 12 },
  
  // Creativity
  { title: "Steal Like an Artist", author: "Austin Kleon", genres: ["Creativity", "Personal Development"], description: "10 things nobody told you about being creative.", duration: 7 },
  { title: "Big Magic", author: "Elizabeth Gilbert", genres: ["Creativity", "Personal Development"], description: "Creative living beyond fear.", duration: 12 },
  { title: "The Artist's Way", author: "Julia Cameron", genres: ["Creativity", "Personal Development"], description: "A spiritual path to higher creativity.", duration: 14 },
  { title: "Creative Confidence", author: "Tom Kelley", genres: ["Creativity", "Business & Entrepreneurship"], description: "Unleashing the creative potential within us all.", duration: 12 },
  { title: "Originals", author: "Adam Grant", genres: ["Creativity", "Psychology & Mindset"], description: "How non-conformists move the world.", duration: 13 },
  { title: "Where Good Ideas Come From", author: "Steven Johnson", genres: ["Creativity", "Science & Technology"], description: "The natural history of innovation.", duration: 12 },
  { title: "A Technique for Producing Ideas", author: "James Webb Young", genres: ["Creativity", "Business & Entrepreneurship"], description: "The simple, five-step formula anyone can use.", duration: 5 },
  { title: "Wired to Create", author: "Scott Barry Kaufman", genres: ["Creativity", "Psychology & Mindset"], description: "Unraveling the mysteries of the creative mind.", duration: 12 },
  { title: "The Creative Habit", author: "Twyla Tharp", genres: ["Creativity", "Personal Development"], description: "Learn it and use it for life.", duration: 13 },
  { title: "Keep Going", author: "Austin Kleon", genres: ["Creativity", "Personal Development"], description: "10 ways to stay creative in good times and bad.", duration: 7 },
  { title: "On Writing", author: "Stephen King", genres: ["Creativity", "Communication"], description: "A memoir of the craft.", duration: 13 },
  { title: "Bird by Bird", author: "Anne Lamott", genres: ["Creativity", "Communication"], description: "Some instructions on writing and life.", duration: 11 },
  { title: "Ignore Everybody", author: "Hugh MacLeod", genres: ["Creativity", "Personal Development"], description: "And 39 other keys to creativity.", duration: 8 },
  { title: "Manage Your Day-to-Day", author: "Jocelyn K. Glei", genres: ["Creativity", "Productivity"], description: "Build your routine, find your focus, and sharpen your creative mind.", duration: 9 },
  { title: "Daily Rituals", author: "Mason Currey", genres: ["Creativity", "Psychology & Mindset"], description: "How artists work.", duration: 11 },
  
  // Science & Technology
  { title: "A Brief History of Time", author: "Stephen Hawking", genres: ["Science & Technology", "Philosophy"], description: "From the Big Bang to black holes.", duration: 12 },
  { title: "The Gene", author: "Siddhartha Mukherjee", genres: ["Science & Technology", "History"], description: "An intimate history.", duration: 18 },
  { title: "Homo Deus", author: "Yuval Noah Harari", genres: ["Science & Technology", "Philosophy"], description: "A brief history of tomorrow.", duration: 16 },
  { title: "The Selfish Gene", author: "Richard Dawkins", genres: ["Science & Technology", "Philosophy"], description: "40th Anniversary Edition.", duration: 15 },
  { title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", genres: ["Science & Technology", "Philosophy"], description: "Everything you need to know about the universe.", duration: 8 },
  { title: "The Sixth Extinction", author: "Elizabeth Kolbert", genres: ["Science & Technology", "History"], description: "An unnatural history.", duration: 13 },
  { title: "Bad Blood", author: "John Carreyrou", genres: ["Science & Technology", "Business & Entrepreneurship"], description: "Secrets and lies in a Silicon Valley startup.", duration: 14 },
  { title: "The Code Breaker", author: "Walter Isaacson", genres: ["Science & Technology", "History"], description: "Jennifer Doudna, gene editing, and the future of the human race.", duration: 18 },
  { title: "Life 3.0", author: "Max Tegmark", genres: ["Science & Technology", "Philosophy"], description: "Being human in the age of artificial intelligence.", duration: 15 },
  { title: "The Future Is Faster Than You Think", author: "Peter H. Diamandis", genres: ["Science & Technology", "Business & Entrepreneurship"], description: "How converging technologies are transforming business, industries, and our lives.", duration: 14 },
  { title: "AI Superpowers", author: "Kai-Fu Lee", genres: ["Science & Technology", "Business & Entrepreneurship"], description: "China, Silicon Valley, and the new world order.", duration: 13 },
  { title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", genres: ["Science & Technology", "History"], description: "She died in 1951, but her cells are still alive today.", duration: 14 },
  { title: "Factfulness", author: "Hans Rosling", genres: ["Science & Technology", "Psychology & Mindset"], description: "Ten reasons we're wrong about the world.", duration: 13 },
  { title: "The Structure of Scientific Revolutions", author: "Thomas S. Kuhn", genres: ["Science & Technology", "Philosophy"], description: "One of the most influential books of the twentieth century.", duration: 12 },
  { title: "Algorithms to Live By", author: "Brian Christian", genres: ["Science & Technology", "Productivity"], description: "The computer science of human decisions.", duration: 14 },
  
  // Philosophy
  { title: "Meditations", author: "Marcus Aurelius", genres: ["Philosophy", "Personal Development"], description: "A new translation.", duration: 10 },
  { title: "The Alchemist", author: "Paulo Coelho", genres: ["Philosophy", "Personal Development"], description: "A fable about following your dream.", duration: 9 },
  { title: "The Daily Stoic", author: "Ryan Holiday", genres: ["Philosophy", "Personal Development"], description: "366 meditations on wisdom, perseverance, and the art of living.", duration: 12 },
  { title: "The Obstacle Is the Way", author: "Ryan Holiday", genres: ["Philosophy", "Personal Development"], description: "The timeless art of turning trials into triumph.", duration: 11 },
  { title: "Ego Is the Enemy", author: "Ryan Holiday", genres: ["Philosophy", "Personal Development"], description: "The fight to master our greatest opponent.", duration: 12 },
  { title: "Stillness Is the Key", author: "Ryan Holiday", genres: ["Philosophy", "Personal Development"], description: "An ancient strategy for modern life.", duration: 11 },
  { title: "Letters from a Stoic", author: "Seneca", genres: ["Philosophy", "Personal Development"], description: "Epistulae Morales ad Lucilium.", duration: 14 },
  { title: "The Art of War", author: "Sun Tzu", genres: ["Philosophy", "Leadership"], description: "The ancient classic.", duration: 6 },
  { title: "The Prince", author: "Niccolò Machiavelli", genres: ["Philosophy", "Leadership"], description: "Political philosophy for the ages.", duration: 8 },
  { title: "Thus Spoke Zarathustra", author: "Friedrich Nietzsche", genres: ["Philosophy", "Personal Development"], description: "A book for all and none.", duration: 14 },
  { title: "The Republic", author: "Plato", genres: ["Philosophy", "History"], description: "The cornerstone of Western philosophy.", duration: 16 },
  { title: "Beyond Good and Evil", author: "Friedrich Nietzsche", genres: ["Philosophy", "Psychology & Mindset"], description: "Prelude to a philosophy of the future.", duration: 12 },
  { title: "The Consolations of Philosophy", author: "Alain de Botton", genres: ["Philosophy", "Personal Development"], description: "How the great philosophers can help us.", duration: 11 },
  { title: "The School of Life", author: "Alain de Botton", genres: ["Philosophy", "Personal Development"], description: "An emotional education.", duration: 12 },
  { title: "When Things Fall Apart", author: "Pema Chödrön", genres: ["Philosophy", "Personal Development"], description: "Heart advice for difficult times.", duration: 10 },
  
  // History
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", genres: ["History", "Science & Technology"], description: "The fates of human societies.", duration: 18 },
  { title: "The Wright Brothers", author: "David McCullough", genres: ["History", "Science & Technology"], description: "The story of the brothers who taught the world to fly.", duration: 14 },
  { title: "Team of Rivals", author: "Doris Kearns Goodwin", genres: ["History", "Leadership"], description: "The political genius of Abraham Lincoln.", duration: 20 },
  { title: "The Power Broker", author: "Robert A. Caro", genres: ["History", "Leadership"], description: "Robert Moses and the fall of New York.", duration: 22 },
  { title: "Alexander Hamilton", author: "Ron Chernow", genres: ["History", "Leadership"], description: "The definitive biography.", duration: 20 },
  { title: "Steve Jobs", author: "Walter Isaacson", genres: ["History", "Business & Entrepreneurship"], description: "The exclusive biography.", duration: 18 },
  { title: "Leonardo da Vinci", author: "Walter Isaacson", genres: ["History", "Creativity"], description: "The biography.", duration: 18 },
  { title: "Benjamin Franklin", author: "Walter Isaacson", genres: ["History", "Leadership"], description: "An American life.", duration: 18 },
  { title: "Einstein", author: "Walter Isaacson", genres: ["History", "Science & Technology"], description: "His life and universe.", duration: 18 },
  { title: "The Rise and Fall of the Third Reich", author: "William L. Shirer", genres: ["History", "Leadership"], description: "A history of Nazi Germany.", duration: 22 },
  { title: "A People's History of the United States", author: "Howard Zinn", genres: ["History", "Philosophy"], description: "1492 to present.", duration: 18 },
  { title: "1776", author: "David McCullough", genres: ["History", "Leadership"], description: "The story of the founding of America.", duration: 15 },
  { title: "The Diary of a Young Girl", author: "Anne Frank", genres: ["History", "Personal Development"], description: "The definitive edition.", duration: 12 },
  { title: "Unbroken", author: "Laura Hillenbrand", genres: ["History", "Personal Development"], description: "A World War II story of survival, resilience, and redemption.", duration: 16 },
  { title: "The Boys in the Boat", author: "Daniel James Brown", genres: ["History", "Personal Development"], description: "Nine Americans and their epic quest for gold at the 1936 Berlin Olympics.", duration: 15 },
  
  // Parenting & Education
  { title: "The Whole-Brain Child", author: "Daniel J. Siegel", genres: ["Parenting & Education", "Psychology & Mindset"], description: "12 revolutionary strategies to nurture your child's developing mind.", duration: 12 },
  { title: "How to Raise an Adult", author: "Julie Lythcott-Haims", genres: ["Parenting & Education", "Personal Development"], description: "Break free of the overparenting trap.", duration: 14 },
  { title: "No-Drama Discipline", author: "Daniel J. Siegel", genres: ["Parenting & Education", "Psychology & Mindset"], description: "The whole-brain way to calm the chaos and nurture your child's developing mind.", duration: 13 },
  { title: "Positive Discipline", author: "Jane Nelsen", genres: ["Parenting & Education", "Psychology & Mindset"], description: "The classic guide to helping children develop self-discipline.", duration: 14 },
  { title: "The Conscious Parent", author: "Dr. Shefali Tsabary", genres: ["Parenting & Education", "Personal Development"], description: "Transforming ourselves, empowering our children.", duration: 13 },
  { title: "Simplicity Parenting", author: "Kim John Payne", genres: ["Parenting & Education", "Health & Wellness"], description: "Using the extraordinary power of less to raise calmer, happier, and more secure kids.", duration: 12 },
  { title: "Unconditional Parenting", author: "Alfie Kohn", genres: ["Parenting & Education", "Psychology & Mindset"], description: "Moving from rewards and punishments to love and reason.", duration: 13 },
  { title: "The Montessori Toddler", author: "Simone Davies", genres: ["Parenting & Education", "Personal Development"], description: "A parent's guide to raising a curious and responsible human being.", duration: 11 },
  { title: "Hunt, Gather, Parent", author: "Michaeleen Doucleff", genres: ["Parenting & Education", "Psychology & Mindset"], description: "What ancient cultures can teach us about the lost art of raising happy, helpful little humans.", duration: 14 },
  { title: "The Self-Driven Child", author: "William Stixrud", genres: ["Parenting & Education", "Psychology & Mindset"], description: "The science and sense of giving your kids more control over their lives.", duration: 14 },
  { title: "Raising Good Humans", author: "Hunter Clarke-Fields", genres: ["Parenting & Education", "Personal Development"], description: "A mindful guide to breaking the cycle of reactive parenting.", duration: 11 },
  { title: "How to Talk So Kids Will Listen", author: "Adele Faber", genres: ["Parenting & Education", "Communication"], description: "And listen so kids will talk.", duration: 12 },
  { title: "The Danish Way of Parenting", author: "Jessica Joelle Alexander", genres: ["Parenting & Education", "Personal Development"], description: "What the happiest people in the world know about raising confident, capable kids.", duration: 10 },
  { title: "Brainstorm", author: "Daniel J. Siegel", genres: ["Parenting & Education", "Psychology & Mindset"], description: "The power and purpose of the teenage brain.", duration: 13 },
  { title: "Educated", author: "Tara Westover", genres: ["Parenting & Education", "History"], description: "A memoir.", duration: 14 },
  
  // Additional titles to reach quota - mixing across categories
  { title: "The Courage to Be Disliked", author: "Ichiro Kishimi", genres: ["Psychology & Mindset", "Philosophy"], description: "The Japanese phenomenon that shows you how to change your life.", duration: 13 },
  { title: "Think Again", author: "Adam Grant", genres: ["Psychology & Mindset", "Personal Development"], description: "The power of knowing what you don't know.", duration: 13 },
  { title: "The Art of Thinking Clearly", author: "Rolf Dobelli", genres: ["Psychology & Mindset", "Personal Development"], description: "Better thinking, better decisions.", duration: 12 },
  { title: "Principles", author: "Ray Dalio", genres: ["Business & Entrepreneurship", "Personal Development"], description: "Life and work.", duration: 18 },
  { title: "The Black Swan", author: "Nassim Nicholas Taleb", genres: ["Psychology & Mindset", "Money & Finance"], description: "The impact of the highly improbable.", duration: 16 },
  { title: "Antifragile", author: "Nassim Nicholas Taleb", genres: ["Psychology & Mindset", "Philosophy"], description: "Things that gain from disorder.", duration: 18 },
  { title: "Skin in the Game", author: "Nassim Nicholas Taleb", genres: ["Psychology & Mindset", "Philosophy"], description: "Hidden asymmetries in daily life.", duration: 14 },
  { title: "Super Thinking", author: "Gabriel Weinberg", genres: ["Psychology & Mindset", "Productivity"], description: "The big book of mental models.", duration: 14 },
  { title: "The Great Mental Models", author: "Shane Parrish", genres: ["Psychology & Mindset", "Personal Development"], description: "General thinking concepts.", duration: 12 },
  { title: "Thinking in Bets", author: "Annie Duke", genres: ["Psychology & Mindset", "Money & Finance"], description: "Making smarter decisions when you don't have all the facts.", duration: 12 },
  { title: "Superforecasting", author: "Philip E. Tetlock", genres: ["Psychology & Mindset", "Science & Technology"], description: "The art and science of prediction.", duration: 14 },
  { title: "The Scout Mindset", author: "Julia Galef", genres: ["Psychology & Mindset", "Personal Development"], description: "Why some people see things clearly and others don't.", duration: 12 },
  { title: "The Almanack of Naval Ravikant", author: "Eric Jorgenson", genres: ["Personal Development", "Money & Finance"], description: "A guide to wealth and happiness.", duration: 10 },
  { title: "Tools of Titans", author: "Tim Ferriss", genres: ["Personal Development", "Productivity"], description: "The tactics, routines, and habits of billionaires, icons, and world-class performers.", duration: 20 },
  { title: "Tribe of Mentors", author: "Tim Ferriss", genres: ["Personal Development", "Career & Success"], description: "Short life advice from the best in the world.", duration: 18 },
  { title: "The 48 Laws of Power", author: "Robert Greene", genres: ["Leadership", "Psychology & Mindset"], description: "The definitive guide to power.", duration: 18 },
  { title: "The 33 Strategies of War", author: "Robert Greene", genres: ["Leadership", "Psychology & Mindset"], description: "A modern guide to the ancient art of war.", duration: 18 },
  { title: "The Laws of Human Nature", author: "Robert Greene", genres: ["Psychology & Mindset", "Leadership"], description: "Understanding people.", duration: 20 },
  { title: "The Art of Seduction", author: "Robert Greene", genres: ["Psychology & Mindset", "Relationships"], description: "An indispensable primer on the art of seduction.", duration: 16 },
  { title: "Switch", author: "Chip Heath", genres: ["Psychology & Mindset", "Leadership"], description: "How to change things when change is hard.", duration: 12 },
  { title: "Decisive", author: "Chip Heath", genres: ["Psychology & Mindset", "Business & Entrepreneurship"], description: "How to make better choices in life and work.", duration: 13 },
  { title: "The Power of Moments", author: "Chip Heath", genres: ["Psychology & Mindset", "Business & Entrepreneurship"], description: "Why certain experiences have extraordinary impact.", duration: 13 },
  { title: "Upstream", author: "Dan Heath", genres: ["Psychology & Mindset", "Leadership"], description: "The quest to solve problems before they happen.", duration: 12 },
  { title: "Give and Take", author: "Adam Grant", genres: ["Career & Success", "Psychology & Mindset"], description: "Why helping others drives our success.", duration: 14 },
  { title: "Option B", author: "Sheryl Sandberg", genres: ["Personal Development", "Psychology & Mindset"], description: "Facing adversity, building resilience, and finding joy.", duration: 12 },
  { title: "Lean In", author: "Sheryl Sandberg", genres: ["Career & Success", "Leadership"], description: "Women, work, and the will to lead.", duration: 13 },
  { title: "Crushing It!", author: "Gary Vaynerchuk", genres: ["Business & Entrepreneurship", "Career & Success"], description: "How great entrepreneurs build their business and influence.", duration: 13 },
  { title: "Jab, Jab, Jab, Right Hook", author: "Gary Vaynerchuk", genres: ["Business & Entrepreneurship", "Communication"], description: "How to tell your story in a noisy social world.", duration: 12 },
  { title: "Building a StoryBrand", author: "Donald Miller", genres: ["Business & Entrepreneurship", "Communication"], description: "Clarify your message so customers will listen.", duration: 11 },
  { title: "Marketing Made Simple", author: "Donald Miller", genres: ["Business & Entrepreneurship", "Communication"], description: "A step-by-step storybrand guide for any business.", duration: 10 },
  { title: "This Is Marketing", author: "Seth Godin", genres: ["Business & Entrepreneurship", "Communication"], description: "You can't be seen until you learn to see.", duration: 11 },
  { title: "Purple Cow", author: "Seth Godin", genres: ["Business & Entrepreneurship", "Creativity"], description: "Transform your business by being remarkable.", duration: 8 },
  { title: "Tribes", author: "Seth Godin", genres: ["Leadership", "Business & Entrepreneurship"], description: "We need you to lead us.", duration: 9 },
  { title: "The Dip", author: "Seth Godin", genres: ["Personal Development", "Career & Success"], description: "A little book that teaches you when to quit.", duration: 6 },
  { title: "Permission Marketing", author: "Seth Godin", genres: ["Business & Entrepreneurship", "Communication"], description: "Turning strangers into friends and friends into customers.", duration: 10 },
  { title: "All Marketers Are Liars", author: "Seth Godin", genres: ["Business & Entrepreneurship", "Psychology & Mindset"], description: "The power of telling authentic stories in a low-trust world.", duration: 10 },
  { title: "Hooked", author: "Nir Eyal", genres: ["Business & Entrepreneurship", "Psychology & Mindset"], description: "How to build habit-forming products.", duration: 11 },
  { title: "Contagious", author: "Jonah Berger", genres: ["Business & Entrepreneurship", "Psychology & Mindset"], description: "Why things catch on.", duration: 11 },
  { title: "Invisible Influence", author: "Jonah Berger", genres: ["Psychology & Mindset", "Business & Entrepreneurship"], description: "The hidden forces that shape behavior.", duration: 12 },
  { title: "The Catalyst", author: "Jonah Berger", genres: ["Psychology & Mindset", "Communication"], description: "How to change anyone's mind.", duration: 12 },
  { title: "Pre-Suasion", author: "Robert B. Cialdini", genres: ["Psychology & Mindset", "Communication"], description: "A revolutionary way to influence and persuade.", duration: 13 },
  { title: "Yes!", author: "Noah J. Goldstein", genres: ["Psychology & Mindset", "Communication"], description: "50 scientifically proven ways to be persuasive.", duration: 11 },
  { title: "To Sell Is Human", author: "Daniel H. Pink", genres: ["Career & Success", "Communication"], description: "The surprising truth about moving others.", duration: 12 },
  { title: "When", author: "Daniel H. Pink", genres: ["Productivity", "Science & Technology"], description: "The scientific secrets of perfect timing.", duration: 12 },
  { title: "A Whole New Mind", author: "Daniel H. Pink", genres: ["Career & Success", "Creativity"], description: "Why right-brainers will rule the future.", duration: 12 },
  { title: "Free to Focus", author: "Michael Hyatt", genres: ["Productivity", "Leadership"], description: "A total productivity system to achieve more by doing less.", duration: 11 },
  { title: "Your Best Year Ever", author: "Michael Hyatt", genres: ["Personal Development", "Productivity"], description: "A 5-step plan for achieving your most important goals.", duration: 10 },
  { title: "No Excuses!", author: "Brian Tracy", genres: ["Personal Development", "Productivity"], description: "The power of self-discipline.", duration: 12 },
  { title: "Goals!", author: "Brian Tracy", genres: ["Personal Development", "Productivity"], description: "How to get everything you want—faster than you ever thought possible.", duration: 11 },
  { title: "Maximum Achievement", author: "Brian Tracy", genres: ["Personal Development", "Career & Success"], description: "Strategies and skills that will unlock your hidden powers to succeed.", duration: 14 },
  { title: "The Power of Full Engagement", author: "Jim Loehr", genres: ["Productivity", "Health & Wellness"], description: "Managing energy, not time, is the key to high performance.", duration: 12 },
  { title: "Make It Stick", author: "Peter C. Brown", genres: ["Psychology & Mindset", "Parenting & Education"], description: "The science of successful learning.", duration: 13 },
  { title: "A Mind for Numbers", author: "Barbara Oakley", genres: ["Parenting & Education", "Science & Technology"], description: "How to excel at math and science.", duration: 13 },
  { title: "Ultralearning", author: "Scott H. Young", genres: ["Parenting & Education", "Personal Development"], description: "Master hard skills, outsmart the competition, and accelerate your career.", duration: 13 },
  { title: "Learn Like a Pro", author: "Barbara Oakley", genres: ["Parenting & Education", "Productivity"], description: "Science-based tools to become better at anything.", duration: 10 },
  { title: "Moonwalking with Einstein", author: "Joshua Foer", genres: ["Science & Technology", "Psychology & Mindset"], description: "The art and science of remembering everything.", duration: 13 },
  { title: "Limitless", author: "Jim Kwik", genres: ["Personal Development", "Productivity"], description: "Upgrade your brain, learn anything faster, and unlock your exceptional life.", duration: 14 },
  { title: "The Extended Mind", author: "Annie Murphy Paul", genres: ["Science & Technology", "Psychology & Mindset"], description: "The power of thinking outside the brain.", duration: 14 },
  { title: "Smarter Faster Better", author: "Charles Duhigg", genres: ["Productivity", "Psychology & Mindset"], description: "The secrets of being productive in life and business.", duration: 14 },
  { title: "Sprint", author: "Jake Knapp", genres: ["Business & Entrepreneurship", "Productivity"], description: "How to solve big problems and test new ideas in just five days.", duration: 12 },
  { title: "The Design of Everyday Things", author: "Don Norman", genres: ["Science & Technology", "Creativity"], description: "Revised and expanded edition.", duration: 14 },
  { title: "Don't Make Me Think", author: "Steve Krug", genres: ["Science & Technology", "Business & Entrepreneurship"], description: "A common sense approach to web usability.", duration: 10 },
  { title: "100 Things Every Designer Needs to Know About People", author: "Susan M. Weinschenk", genres: ["Science & Technology", "Psychology & Mindset"], description: "What makes them tick?", duration: 12 },
  { title: "Sprint", author: "Jake Knapp", genres: ["Business & Entrepreneurship", "Creativity"], description: "How to solve big problems and test new ideas in just five days.", duration: 12 },
  { title: "Value Proposition Design", author: "Alexander Osterwalder", genres: ["Business & Entrepreneurship", "Creativity"], description: "How to create products and services customers want.", duration: 13 },
  { title: "Business Model Generation", author: "Alexander Osterwalder", genres: ["Business & Entrepreneurship", "Creativity"], description: "A handbook for visionaries, game changers, and challengers.", duration: 14 },
  { title: "Playing to Win", author: "A.G. Lafley", genres: ["Business & Entrepreneurship", "Leadership"], description: "How strategy really works.", duration: 12 },
  { title: "Competitive Strategy", author: "Michael E. Porter", genres: ["Business & Entrepreneurship", "Leadership"], description: "Techniques for analyzing industries and competitors.", duration: 15 },
  { title: "The Strategy Book", author: "Max McKeown", genres: ["Business & Entrepreneurship", "Leadership"], description: "How to think and act strategically.", duration: 12 },
  { title: "HBR's 10 Must Reads on Strategy", author: "Harvard Business Review", genres: ["Business & Entrepreneurship", "Leadership"], description: "Essential reading on strategy.", duration: 13 },
  { title: "The Effective Executive", author: "Peter F. Drucker", genres: ["Leadership", "Productivity"], description: "The definitive guide to getting the right things done.", duration: 11 },
  { title: "Management", author: "Peter F. Drucker", genres: ["Leadership", "Business & Entrepreneurship"], description: "Tasks, responsibilities, practices.", duration: 16 },
  { title: "The Practice of Management", author: "Peter F. Drucker", genres: ["Leadership", "Business & Entrepreneurship"], description: "The groundbreaking work that started it all.", duration: 14 },
  { title: "First, Break All the Rules", author: "Marcus Buckingham", genres: ["Leadership", "Business & Entrepreneurship"], description: "What the world's greatest managers do differently.", duration: 13 },
  { title: "Now, Discover Your Strengths", author: "Marcus Buckingham", genres: ["Career & Success", "Personal Development"], description: "Free access to the StrengthsFinder profile.", duration: 12 },
  { title: "StrengthsFinder 2.0", author: "Tom Rath", genres: ["Career & Success", "Personal Development"], description: "A new and upgraded edition of the online test.", duration: 10 },
  { title: "How Full Is Your Bucket?", author: "Tom Rath", genres: ["Personal Development", "Relationships"], description: "Positive strategies for work and life.", duration: 8 },
  { title: "Wellbeing", author: "Tom Rath", genres: ["Health & Wellness", "Personal Development"], description: "The five essential elements.", duration: 10 },
  { title: "High Output Management", author: "Andrew S. Grove", genres: ["Leadership", "Business & Entrepreneurship"], description: "Former Intel CEO's guide to management.", duration: 13 },
  { title: "Only the Paranoid Survive", author: "Andrew S. Grove", genres: ["Business & Entrepreneurship", "Leadership"], description: "How to exploit the crisis points that challenge every company.", duration: 12 },
  { title: "Amp It Up", author: "Frank Slootman", genres: ["Leadership", "Business & Entrepreneurship"], description: "Leading for hypergrowth by raising expectations, increasing urgency, and elevating intensity.", duration: 11 },
  { title: "What You Do Is Who You Are", author: "Ben Horowitz", genres: ["Leadership", "Business & Entrepreneurship"], description: "How to create your business culture.", duration: 13 },
  { title: "Who", author: "Geoff Smart", genres: ["Leadership", "Business & Entrepreneurship"], description: "The A method for hiring.", duration: 10 },
  { title: "Work Rules!", author: "Laszlo Bock", genres: ["Leadership", "Business & Entrepreneurship"], description: "Insights from inside Google that will transform how you live and lead.", duration: 14 },
  { title: "Powerful", author: "Patty McCord", genres: ["Leadership", "Business & Entrepreneurship"], description: "Building a culture of freedom and responsibility.", duration: 11 },
  { title: "No Rules Rules", author: "Reed Hastings", genres: ["Leadership", "Business & Entrepreneurship"], description: "Netflix and the culture of reinvention.", duration: 14 },
  { title: "That Will Never Work", author: "Marc Randolph", genres: ["Business & Entrepreneurship", "History"], description: "The birth of Netflix and the amazing life of an idea.", duration: 13 },
  { title: "Super Pumped", author: "Mike Isaac", genres: ["Business & Entrepreneurship", "History"], description: "The battle for Uber.", duration: 14 },
  { title: "The Everything Store", author: "Brad Stone", genres: ["Business & Entrepreneurship", "History"], description: "Jeff Bezos and the age of Amazon.", duration: 15 },
  { title: "Amazon Unbound", author: "Brad Stone", genres: ["Business & Entrepreneurship", "History"], description: "Jeff Bezos and the invention of a global empire.", duration: 16 },
  { title: "Working Backwards", author: "Colin Bryar", genres: ["Business & Entrepreneurship", "Leadership"], description: "Insights, stories, and secrets from inside Amazon.", duration: 13 },
  { title: "The Ride of a Lifetime", author: "Robert Iger", genres: ["Leadership", "Business & Entrepreneurship"], description: "Lessons learned from 15 years as CEO of the Walt Disney Company.", duration: 12 },
  { title: "Grinding It Out", author: "Ray Kroc", genres: ["Business & Entrepreneurship", "History"], description: "The making of McDonald's.", duration: 11 },
  { title: "Pour Your Heart Into It", author: "Howard Schultz", genres: ["Business & Entrepreneurship", "Leadership"], description: "How Starbucks built a company one cup at a time.", duration: 13 },
  { title: "Made in America", author: "Sam Walton", genres: ["Business & Entrepreneurship", "History"], description: "My story.", duration: 12 },
  { title: "Let My People Go Surfing", author: "Yvon Chouinard", genres: ["Business & Entrepreneurship", "Philosophy"], description: "The education of a reluctant businessman.", duration: 12 },
  { title: "Onward", author: "Howard Schultz", genres: ["Business & Entrepreneurship", "Leadership"], description: "How Starbucks fought for its life without losing its soul.", duration: 14 },
  { title: "The Virgin Way", author: "Richard Branson", genres: ["Business & Entrepreneurship", "Leadership"], description: "Everything I know about leadership.", duration: 13 },
  { title: "Losing My Virginity", author: "Richard Branson", genres: ["Business & Entrepreneurship", "History"], description: "How I survived, had fun, and made a fortune doing business my way.", duration: 15 },
  { title: "Screw It, Let's Do It", author: "Richard Branson", genres: ["Business & Entrepreneurship", "Personal Development"], description: "Lessons in life.", duration: 9 },
  { title: "How I Built This", author: "Guy Raz", genres: ["Business & Entrepreneurship", "Career & Success"], description: "The unexpected paths to success from the world's most inspiring entrepreneurs.", duration: 14 },
  { title: "Bold", author: "Peter H. Diamandis", genres: ["Business & Entrepreneurship", "Science & Technology"], description: "How to go big, create wealth and impact the world.", duration: 14 },
  { title: "Abundance", author: "Peter H. Diamandis", genres: ["Science & Technology", "Philosophy"], description: "The future is better than you think.", duration: 14 },
  { title: "The Infinite Game", author: "Simon Sinek", genres: ["Leadership", "Business & Entrepreneurship"], description: "How great businesses achieve long-lasting success.", duration: 12 },
  { title: "Find Your Why", author: "Simon Sinek", genres: ["Leadership", "Career & Success"], description: "A practical guide for discovering purpose for you and your team.", duration: 10 },
  { title: "Together Is Better", author: "Simon Sinek", genres: ["Leadership", "Personal Development"], description: "A little book of inspiration.", duration: 6 },
  { title: "The Speed of Trust", author: "Stephen M.R. Covey", genres: ["Leadership", "Communication"], description: "The one thing that changes everything.", duration: 13 },
  { title: "The 8th Habit", author: "Stephen R. Covey", genres: ["Leadership", "Personal Development"], description: "From effectiveness to greatness.", duration: 15 },
  { title: "First Things First", author: "Stephen R. Covey", genres: ["Productivity", "Personal Development"], description: "To live, to love, to learn, to leave a legacy.", duration: 14 },
  { title: "Principle-Centered Leadership", author: "Stephen R. Covey", genres: ["Leadership", "Personal Development"], description: "Timeless principles for managing people.", duration: 13 },
  { title: "How Successful People Think", author: "John C. Maxwell", genres: ["Personal Development", "Psychology & Mindset"], description: "Change your thinking, change your life.", duration: 8 },
  { title: "Developing the Leader Within You", author: "John C. Maxwell", genres: ["Leadership", "Personal Development"], description: "Discover how to lead others.", duration: 11 },
  { title: "The 5 Levels of Leadership", author: "John C. Maxwell", genres: ["Leadership", "Career & Success"], description: "Proven steps to maximize your potential.", duration: 12 },
  { title: "Leadershift", author: "John C. Maxwell", genres: ["Leadership", "Personal Development"], description: "The 11 essential changes every leader must embrace.", duration: 12 },
  { title: "Good Leaders Ask Great Questions", author: "John C. Maxwell", genres: ["Leadership", "Communication"], description: "Your foundation for successful leadership.", duration: 12 },
  { title: "Failing Forward", author: "John C. Maxwell", genres: ["Personal Development", "Career & Success"], description: "Turning mistakes into stepping stones for success.", duration: 11 },
  { title: "Talent Is Overrated", author: "Geoff Colvin", genres: ["Career & Success", "Psychology & Mindset"], description: "What really separates world-class performers from everybody else.", duration: 12 },
  { title: "Bounce", author: "Matthew Syed", genres: ["Psychology & Mindset", "Personal Development"], description: "Mozart, Federer, Picasso, Beckham, and the science of success.", duration: 12 },
  { title: "The Talent Code", author: "Daniel Coyle", genres: ["Psychology & Mindset", "Personal Development"], description: "Greatness isn't born. It's grown.", duration: 12 },
  { title: "Relentless", author: "Tim S. Grover", genres: ["Personal Development", "Psychology & Mindset"], description: "From good to great to unstoppable.", duration: 11 },
  { title: "Winning", author: "Tim S. Grover", genres: ["Personal Development", "Leadership"], description: "The unforgiving race to greatness.", duration: 10 },
  { title: "Chop Wood Carry Water", author: "Joshua Medcalf", genres: ["Personal Development", "Philosophy"], description: "How to fall in love with the process of becoming great.", duration: 9 },
  { title: "The Inner Game of Tennis", author: "W. Timothy Gallwey", genres: ["Psychology & Mindset", "Personal Development"], description: "The classic guide to the mental side of peak performance.", duration: 10 },
  { title: "With Winning in Mind", author: "Lanny Bassham", genres: ["Psychology & Mindset", "Personal Development"], description: "The mental management system.", duration: 10 },
  { title: "Mind Gym", author: "Gary Mack", genres: ["Psychology & Mindset", "Personal Development"], description: "An athlete's guide to inner excellence.", duration: 11 },
  { title: "Legacy", author: "James Kerr", genres: ["Leadership", "Personal Development"], description: "What the All Blacks can teach us about the business of life.", duration: 11 },
  { title: "The Mamba Mentality", author: "Kobe Bryant", genres: ["Personal Development", "Psychology & Mindset"], description: "How I play.", duration: 10 },
  { title: "Eleven Rings", author: "Phil Jackson", genres: ["Leadership", "Personal Development"], description: "The soul of success.", duration: 14 },
  { title: "The Score Takes Care of Itself", author: "Bill Walsh", genres: ["Leadership", "Business & Entrepreneurship"], description: "My philosophy of leadership.", duration: 12 },
  { title: "Shoe Dog", author: "Phil Knight", genres: ["Business & Entrepreneurship", "Personal Development"], description: "A memoir by the creator of Nike.", duration: 16 },
  { title: "Open", author: "Andre Agassi", genres: ["Personal Development", "Psychology & Mindset"], description: "An autobiography.", duration: 15 },
  { title: "Total Recall", author: "Arnold Schwarzenegger", genres: ["Personal Development", "Career & Success"], description: "My unbelievably true life story.", duration: 18 },
  { title: "Be Useful", author: "Arnold Schwarzenegger", genres: ["Personal Development", "Career & Success"], description: "Seven tools for life.", duration: 12 },
  { title: "Greenlights", author: "Matthew McConaughey", genres: ["Personal Development", "Philosophy"], description: "Catching them, living them.", duration: 12 },
  { title: "Becoming", author: "Michelle Obama", genres: ["Personal Development", "History"], description: "A memoir.", duration: 16 },
  { title: "The Light We Carry", author: "Michelle Obama", genres: ["Personal Development", "Psychology & Mindset"], description: "Overcoming in uncertain times.", duration: 13 },
  { title: "A Promised Land", author: "Barack Obama", genres: ["History", "Leadership"], description: "A memoir.", duration: 20 },
  { title: "Dreams from My Father", author: "Barack Obama", genres: ["Personal Development", "History"], description: "A story of race and inheritance.", duration: 15 },
  { title: "Long Walk to Freedom", author: "Nelson Mandela", genres: ["History", "Leadership"], description: "The autobiography of Nelson Mandela.", duration: 18 },
  { title: "The Autobiography of Malcolm X", author: "Malcolm X", genres: ["History", "Personal Development"], description: "As told to Alex Haley.", duration: 16 },
  { title: "I Know Why the Caged Bird Sings", author: "Maya Angelou", genres: ["History", "Personal Development"], description: "A memoir.", duration: 13 },
  { title: "When Breath Becomes Air", author: "Paul Kalanithi", genres: ["Health & Wellness", "Philosophy"], description: "A memoir.", duration: 10 },
  { title: "Being Mortal", author: "Atul Gawande", genres: ["Health & Wellness", "Philosophy"], description: "Medicine and what matters in the end.", duration: 13 },
  { title: "The Checklist Manifesto", author: "Atul Gawande", genres: ["Productivity", "Health & Wellness"], description: "How to get things right.", duration: 11 },
  { title: "Better", author: "Atul Gawande", genres: ["Health & Wellness", "Personal Development"], description: "A surgeon's notes on performance.", duration: 12 },
  { title: "Complications", author: "Atul Gawande", genres: ["Health & Wellness", "Science & Technology"], description: "A surgeon's notes on an imperfect science.", duration: 13 },
  { title: "Quiet Power", author: "Susan Cain", genres: ["Parenting & Education", "Psychology & Mindset"], description: "The secret strengths of introverted kids.", duration: 11 },
  { title: "Bittersweet", author: "Susan Cain", genres: ["Psychology & Mindset", "Philosophy"], description: "How sorrow and longing make us whole.", duration: 13 },
  { title: "The Untethered Soul", author: "Michael A. Singer", genres: ["Philosophy", "Personal Development"], description: "The journey beyond yourself.", duration: 11 },
  { title: "The Surrender Experiment", author: "Michael A. Singer", genres: ["Philosophy", "Personal Development"], description: "My journey into life's perfection.", duration: 12 },
  { title: "Living Untethered", author: "Michael A. Singer", genres: ["Philosophy", "Personal Development"], description: "Beyond the human predicament.", duration: 11 },
  { title: "A New Earth", author: "Eckhart Tolle", genres: ["Philosophy", "Personal Development"], description: "Awakening to your life's purpose.", duration: 13 },
  { title: "Practicing the Power of Now", author: "Eckhart Tolle", genres: ["Philosophy", "Personal Development"], description: "Essential teachings, meditations, and exercises.", duration: 9 },
  { title: "The Monk Who Sold His Ferrari", author: "Robin Sharma", genres: ["Personal Development", "Philosophy"], description: "A fable about fulfilling your dreams and reaching your destiny.", duration: 11 },
  { title: "The Leader Who Had No Title", author: "Robin Sharma", genres: ["Leadership", "Personal Development"], description: "A modern fable on real success in business and in life.", duration: 11 },
  { title: "Who Will Cry When You Die?", author: "Robin Sharma", genres: ["Personal Development", "Philosophy"], description: "Life lessons from the monk who sold his Ferrari.", duration: 10 },
  { title: "The Greatness Guide", author: "Robin Sharma", genres: ["Personal Development", "Productivity"], description: "101 lessons for making what's good at work and in life even better.", duration: 10 },
  { title: "Think Like a Monk", author: "Jay Shetty", genres: ["Personal Development", "Philosophy"], description: "Train your mind for peace and purpose every day.", duration: 13 },
  { title: "8 Rules of Love", author: "Jay Shetty", genres: ["Relationships", "Personal Development"], description: "How to find it, keep it, and let it go.", duration: 12 },
  { title: "How to Be an Antiracist", author: "Ibram X. Kendi", genres: ["Philosophy", "History"], description: "A memoir.", duration: 13 },
  { title: "White Fragility", author: "Robin DiAngelo", genres: ["Psychology & Mindset", "Philosophy"], description: "Why it's so hard for white people to talk about racism.", duration: 11 },
  { title: "Caste", author: "Isabel Wilkerson", genres: ["History", "Philosophy"], description: "The origins of our discontents.", duration: 16 },
  { title: "The Warmth of Other Suns", author: "Isabel Wilkerson", genres: ["History", "Personal Development"], description: "The epic story of America's great migration.", duration: 18 },
  { title: "Just Mercy", author: "Bryan Stevenson", genres: ["History", "Philosophy"], description: "A story of justice and redemption.", duration: 14 },
  { title: "Talking to Strangers", author: "Malcolm Gladwell", genres: ["Psychology & Mindset", "Communication"], description: "What we should know about the people we don't know.", duration: 13 },
  { title: "David and Goliath", author: "Malcolm Gladwell", genres: ["Psychology & Mindset", "Personal Development"], description: "Underdogs, misfits, and the art of battling giants.", duration: 12 },
  { title: "What the Dog Saw", author: "Malcolm Gladwell", genres: ["Psychology & Mindset", "Science & Technology"], description: "And other adventures.", duration: 14 },
  { title: "Freakonomics", author: "Steven D. Levitt", genres: ["Psychology & Mindset", "Science & Technology"], description: "A rogue economist explores the hidden side of everything.", duration: 12 },
  { title: "SuperFreakonomics", author: "Steven D. Levitt", genres: ["Psychology & Mindset", "Science & Technology"], description: "Global cooling, patriotic prostitutes, and why suicide bombers should buy life insurance.", duration: 12 },
  { title: "Think Like a Freak", author: "Steven D. Levitt", genres: ["Psychology & Mindset", "Creativity"], description: "The authors of Freakonomics offer to retrain your brain.", duration: 11 },
  { title: "When to Rob a Bank", author: "Steven D. Levitt", genres: ["Psychology & Mindset", "Science & Technology"], description: "And 131 more warped suggestions and well-intended rants.", duration: 11 },
  { title: "Nudge", author: "Richard H. Thaler", genres: ["Psychology & Mindset", "Business & Entrepreneurship"], description: "Improving decisions about health, wealth, and happiness.", duration: 13 },
  { title: "Misbehaving", author: "Richard H. Thaler", genres: ["Psychology & Mindset", "Science & Technology"], description: "The making of behavioral economics.", duration: 14 },
  { title: "Noise", author: "Daniel Kahneman", genres: ["Psychology & Mindset", "Science & Technology"], description: "A flaw in human judgment.", duration: 15 },
  { title: "Sway", author: "Ori Brafman", genres: ["Psychology & Mindset", "Business & Entrepreneurship"], description: "The irresistible pull of irrational behavior.", duration: 10 },
  { title: "The Upside of Irrationality", author: "Dan Ariely", genres: ["Psychology & Mindset", "Personal Development"], description: "The unexpected benefits of defying logic at work and at home.", duration: 13 },
  { title: "The Honest Truth About Dishonesty", author: "Dan Ariely", genres: ["Psychology & Mindset", "Business & Entrepreneurship"], description: "How we lie to everyone—especially ourselves.", duration: 12 },
  { title: "Payoff", author: "Dan Ariely", genres: ["Psychology & Mindset", "Business & Entrepreneurship"], description: "The hidden logic that shapes our motivations.", duration: 8 },
  { title: "The Why Axis", author: "Uri Gneezy", genres: ["Psychology & Mindset", "Science & Technology"], description: "Hidden motives and the undiscovered economics of everyday life.", duration: 12 },
  { title: "Scarcity", author: "Sendhil Mullainathan", genres: ["Psychology & Mindset", "Money & Finance"], description: "Why having too little means so much.", duration: 12 },
  { title: "Dollars and Sense", author: "Dan Ariely", genres: ["Money & Finance", "Psychology & Mindset"], description: "How we misthink money and how to spend smarter.", duration: 11 },
  { title: "Happy Money", author: "Elizabeth Dunn", genres: ["Money & Finance", "Psychology & Mindset"], description: "The science of happier spending.", duration: 10 },
  { title: "Mind Over Money", author: "Brad Klontz", genres: ["Money & Finance", "Psychology & Mindset"], description: "Overcoming the money disorders that threaten our financial health.", duration: 11 },
  { title: "Secrets of the Millionaire Mind", author: "T. Harv Eker", genres: ["Money & Finance", "Personal Development"], description: "Mastering the inner game of wealth.", duration: 12 },
  { title: "You Are a Badass at Making Money", author: "Jen Sincero", genres: ["Money & Finance", "Personal Development"], description: "Master the mindset of wealth.", duration: 11 },
  { title: "Money Honey", author: "Rachel Richards", genres: ["Money & Finance", "Personal Development"], description: "A simple 7-step guide for getting your financial $hit together.", duration: 10 },
  { title: "Get Good with Money", author: "Tiffany Aliche", genres: ["Money & Finance", "Personal Development"], description: "Ten simple steps to becoming financially whole.", duration: 12 },
  { title: "We Should All Be Millionaires", author: "Rachel Rodgers", genres: ["Money & Finance", "Personal Development"], description: "A woman's guide to earning more, building wealth, and gaining economic power.", duration: 12 },
  { title: "Broke Millennial", author: "Erin Lowry", genres: ["Money & Finance", "Personal Development"], description: "Stop scraping by and get your financial life together.", duration: 12 },
  { title: "The Behavior Gap", author: "Carl Richards", genres: ["Money & Finance", "Psychology & Mindset"], description: "Simple ways to stop doing dumb things with money.", duration: 10 },
  { title: "The One-Page Financial Plan", author: "Carl Richards", genres: ["Money & Finance", "Personal Development"], description: "A simple way to be smart about your money.", duration: 9 },
  { title: "The Little Book of Common Sense Investing", author: "John C. Bogle", genres: ["Money & Finance", "Business & Entrepreneurship"], description: "The only way to guarantee your fair share of stock market returns.", duration: 11 },
  { title: "The Bogleheads' Guide to Investing", author: "Taylor Larimore", genres: ["Money & Finance", "Personal Development"], description: "A guide to simple, sound investing.", duration: 13 },
  { title: "Quit Like a Millionaire", author: "Kristy Shen", genres: ["Money & Finance", "Personal Development"], description: "No gimmicks, luck, or trust fund required.", duration: 12 },
  { title: "Early Retirement Extreme", author: "Jacob Lund Fisker", genres: ["Money & Finance", "Philosophy"], description: "A philosophical and practical guide to financial independence.", duration: 13 },
  { title: "Work Optional", author: "Tanja Hester", genres: ["Money & Finance", "Career & Success"], description: "Retire early the non-penny-pinching way.", duration: 12 },
  { title: "Playing with FIRE", author: "Scott Rieckens", genres: ["Money & Finance", "Personal Development"], description: "Financial independence, retire early.", duration: 11 },
  { title: "Choose FI", author: "Chris Mamula", genres: ["Money & Finance", "Personal Development"], description: "Your blueprint to financial independence.", duration: 12 },
  { title: "The 4% Rule and Safe Withdrawal Rates in Retirement", author: "Michael Kitces", genres: ["Money & Finance", "Personal Development"], description: "Understanding withdrawal strategies.", duration: 10 },
];

const NARRATORS = [
  "James Smith",
  "Sarah Johnson",
  "Michael Chen",
  "Emily Davis",
  "Robert Taylor",
  "Jessica Williams",
  "David Brown",
  "Amanda Miller",
  "Christopher Lee",
  "Michelle Garcia",
  "Daniel Martinez",
  "Jennifer Robinson",
  "Matthew Clark",
  "Ashley Rodriguez",
  "Joshua Lewis",
];

function getRandomDuration(): number {
  return Math.floor(Math.random() * 15) + 8;
}

function getRandomNarrator(): string {
  return NARRATORS[Math.floor(Math.random() * NARRATORS.length)];
}

async function main() {
  console.log("Starting catalogue seed...");

  console.log("Creating genres...");
  const genreMap = new Map<string, string>();
  for (const genreName of GENRES) {
    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });
    genreMap.set(genreName, genre.id);
  }
  console.log(`Created ${genreMap.size} genres`);

  console.log("Creating narrators...");
  const narratorMap = new Map<string, string>();
  for (const narratorName of NARRATORS) {
    const existingNarrator = await prisma.narrator.findFirst({
      where: { name: narratorName },
    });
    if (existingNarrator) {
      narratorMap.set(narratorName, existingNarrator.id);
    } else {
      const narrator = await prisma.narrator.create({
        data: { name: narratorName },
      });
      narratorMap.set(narratorName, narrator.id);
    }
  }
  console.log(`Created ${narratorMap.size} narrators`);

  console.log("Creating authors and audiobooks...");
  const authorMap = new Map<string, string>();
  let createdCount = 0;
  let skippedCount = 0;

  for (const book of BOOKS) {
    const existingBook = await prisma.audiobook.findFirst({
      where: { title: book.title },
    });

    if (existingBook) {
      skippedCount++;
      continue;
    }

    let authorId = authorMap.get(book.author);
    if (!authorId) {
      const existingAuthor = await prisma.author.findFirst({
        where: { name: book.author },
      });
      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        const author = await prisma.author.create({
          data: { name: book.author },
        });
        authorId = author.id;
      }
      authorMap.set(book.author, authorId);
    }

    const narratorName = getRandomNarrator();
    const narratorId = narratorMap.get(narratorName)!;

    const genreIds = book.genres
      .map((g) => genreMap.get(g))
      .filter((id): id is string => !!id);

    await prisma.audiobook.create({
      data: {
        title: book.title,
        description: book.description,
        totalDuration: book.duration * 60,
        language: "en",
        authorId,
        narrators: {
          create: [{ narratorId }],
        },
        genres: {
          create: genreIds.map((genreId) => ({ genreId })),
        },
      },
    });

    createdCount++;
    if (createdCount % 50 === 0) {
      console.log(`Progress: ${createdCount} audiobooks created...`);
    }
  }

  console.log(`\nSeed complete!`);
  console.log(`- Created: ${createdCount} audiobooks`);
  console.log(`- Skipped: ${skippedCount} (already exist)`);
  console.log(`- Authors: ${authorMap.size}`);
  console.log(`- Genres: ${genreMap.size}`);
  console.log(`- Narrators: ${narratorMap.size}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
