import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ---------------------------------------------------------------
// Helpers

function randomDate(maxDaysAgo) {
  return new Date(Date.now() - Math.random() * maxDaysAgo * 86_400_000)
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------------------------------------------------------------
// Static Data 

const USERS = [
  { username: 'alexrivera',      email: 'alex.rivera@hive.app',      popular: true  },
  { username: 'jordankim',       email: 'jordan.kim@hive.app',        popular: true  },
  { username: 'mayapatel',       email: 'maya.patel@hive.app',        popular: true  },
  { username: 'emmataylor',      email: 'emma.taylor@hive.app',       popular: true  },
  { username: 'harperh',         email: 'harper.harris@hive.app',     popular: true  },
  { username: 'jameshall',       email: 'james.hall@hive.app',        popular: true  },
  { username: 'avaj',            email: 'ava.johnson@hive.app',       popular: true  },
  { username: 'liamchen',        email: 'liam.chen@hive.app',         popular: false },
  { username: 'sofianguyen',     email: 'sofia.nguyen@hive.app',      popular: false },
  { username: 'noahw',           email: 'noah.williams@hive.app',     popular: false },
  { username: 'ethanb',          email: 'ethan.brown@hive.app',       popular: false },
  { username: 'isabellamartinez',email: 'isabella.martinez@hive.app', popular: false },
  { username: 'oliveranderson',  email: 'oliver.anderson@hive.app',   popular: false },
  { username: 'lucasmoore',      email: 'lucas.moore@hive.app',       popular: false },
  { username: 'ameliaj',         email: 'amelia.jackson@hive.app',    popular: false },
  { username: 'masonwhite',      email: 'mason.white@hive.app',       popular: false },
  { username: 'elijahclark',     email: 'elijah.clark@hive.app',      popular: false },
  { username: 'evelynlewis',     email: 'evelyn.lewis@hive.app',      popular: false },
  { username: 'aidenr',          email: 'aiden.robinson@hive.app',    popular: false },
  { username: 'abigailw',        email: 'abigail.walker@hive.app',    popular: false },
]

const BIOS = [
  'Just here to share my thoughts ✨',
  'Coffee addict | Developer | Dreamer',
  'Traveling the world one city at a time 🌍',
  'Fitness enthusiast & food lover',
  'Making things that matter',
  'CS student | Tech & coffee',
  'Photographer by passion, coder by trade',
  'Living my best life 🌟',
  'Books, coffee, and long walks 📚',
  'Design is my language',
  'Building cool stuff on the internet',
  'Hiking trails and writing code',
]

const POST_CONTENTS = [
  'Just finished a 10k run this morning. The feeling after crossing that finish line is indescribable 🏃',
  'Hot take: dark mode should be the default for every app. Fight me.',
  'Made homemade pasta from scratch for the first time tonight. Honestly not as hard as I thought!',
  'The sunset from my balcony right now is absolutely unreal 🌅',
  'Finally switched to a mechanical keyboard and I cannot go back. The typing experience is completely different.',
  'PSA: drink your water. That is all.',
  'Three years ago I could barely write a for loop. Today I shipped my first production feature. Keep going.',
  'Weekend hiking trip was exactly what I needed. Disconnecting from everything for 48 hours felt incredible.',
  'Why is it that the best ideas always come to you in the shower?',
  'Started reading again after a two-year break. Finished a book in three days. Felt amazing.',
  'Cooked a full meal from scratch, cleaned the apartment, and hit the gym — all before noon.',
  'Reminder that comparing your chapter 1 to someone else\'s chapter 20 helps no one.',
  'Currently obsessed with this playlist I found. Productivity has gone through the roof.',
  'My team just hit our Q1 goals. So proud of everyone who put in the work 🙌',
  'Controversial opinion: pineapple belongs on pizza and I will die on this hill.',
  'Late night coding session, third coffee, and a bug that has no right to be this stubborn.',
  'Farmers market haul this morning was unbelievable. Produce just hits different when it\'s fresh.',
  'Every time I try to learn something new, I remember how much I don\'t know. Humbling.',
  'The best investment I ever made was buying a good mattress. Sleep quality changed everything.',
  'Working from a café today. The background noise is somehow more productive than dead silence.',
  'Finally got around to organizing my bookmarks. Found articles I saved in 2021 I still haven\'t read.',
  'My mom called just to tell me she\'s proud of me and now I can\'t focus on anything else.',
  'Week 8 of learning guitar. My fingers hurt but the progress is real 🎸',
  'AI tools are great until they confidently give you the wrong answer and you ship it.',
  'Spring cleaning the code repo today. Deleting dead files feels as good as cleaning out a closet.',
  'Unpopular opinion: standing desks are overrated. Just take more walking breaks.',
  'New coffee shop opened around the corner. The cortado here might change my life.',
  'Took a mental health day today. Not productive in the traditional sense but very necessary.',
  'Sometimes the best debugging tool is explaining the problem out loud to someone else.',
  'Just watched the most underrated film I\'ve ever seen. Nobody talks about it and that\'s a crime.',
  'The amount of time I spent searching for the right font today was genuinely embarrassing.',
  'Social media makes everything look easy. Remember that nobody posts the hard days.',
  'Road trip playlist > everything else. There is no debate.',
  'Had the most inspiring conversation with a stranger at the airport. Never underestimate random connections.',
  'Finally set up my home workspace properly. The difference in focus is night and day.',
  'The gym was packed at 6am which tells me January is still technically alive for some people.',
  'New semester starting. This year I actually do the readings.',
  'Deep in a rabbit hole about city planning and transit systems. Send help.',
  'Coworker brought homemade baklava to the office. Productivity was lost.',
  'Trying to explain what I do to relatives at family dinner is an experience every time.',
  'Just discovered that a feature I spent a week building already existed in the codebase. Classic.',
  'The cherry blossoms are out and I have decided to accept that spring is real.',
  'Been journaling every morning for 30 days. Surprised at how much it helps with clarity.',
  'Started meal prepping and I genuinely cannot believe I lived any other way.',
  'There is no feeling quite like closing 47 browser tabs you no longer need.',
  'Running into an old friend you haven\'t seen in years and picking up right where you left off.',
  'Local bookstore is closing. Bought more books than I can read in a year.',
  'Getting into cooking was the best pandemic habit I kept going.',
  'Found my old journal from five years ago. The growth is actually visible and that is wild.',
  'Buildings with good natural light deserve way more credit. Honorable architecture mention.',
  'Nothing humbles you faster than trying to explain recursion to someone for the first time.',
  'The feeling of deleting more lines of code than you added in a PR is unmatched.',
  'Accidentally closed the terminal with 4 hours of work. Everything is fine. I am fine.',
  'Went for a walk with no destination in mind. Ended up finding the best taco stand.',
  'Submitted my first open-source PR today. Scared but proud.',
  'Three monitors and a standing desk later: still procrastinating, just more ergonomically.',
  'Finished a side project that has been 90% done for six months. Shipping is the hardest part.',
  'The confidence gap between junior and senior developers is mostly just the comfort with not knowing.',
  'Finally learned to say no to meetings that could have been emails.',
  'Deadlines make me productive in a way that nothing else does. Unfortunately.',
  'Gratitude list today: good coffee, stable Wi-Fi, a codebase that actually has tests.',
]

const COMMENT_CONTENTS = [
  'This is so true!',
  'Needed to hear this today 🙌',
  'Love this perspective.',
  'You always post the best content.',
  'Can relate to this way too much.',
  'Facts 💯',
  'The accuracy of this post 😭',
  'Same honestly.',
  'This hit different.',
  'Keep posting, love your feed!',
  'Okay but why is this so relatable',
  'This made my day better.',
  'How do you always know what to say?',
  'Saving this post.',
  '100% agree with all of this.',
  'Send me the playlist 👀',
  'Which book was it??',
  'What hiking trail was this??',
  'Recipe please!',
  'You are an inspiration honestly.',
  'This is the content I follow you for.',
  'I felt this in my soul.',
  'Laughed out loud at this 😂',
  'Exactly what I was thinking.',
  'The way I needed this reminder today.',
  'More people need to see this.',
  'Never thought about it this way!',
  'The realest post on this app.',
  'We love an honest moment.',
  'Big agree, finally someone said it.',
  'Okay this one got me.',
  'Please never stop posting.',
  'Living for this energy.',
  'You put into words what I couldn\'t.',
  'Genuinely laughed at this one.',
  'This is giving me the motivation I needed.',
  'Bookmarked. Coming back to this.',
  'The accuracy is alarming.',
  'Why does this describe my life so well.',
  'I needed to see this today, thank you.',
]

// ---------------------------------------------------------------
// Seed 

async function main() {
  console.log('Clearing existing data...')
  await prisma.follow.deleteMany()
  await prisma.like.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  // -- Users --
  console.log('Seeding users...')
  const users = []
  for (const u of USERS) {
    const user = await prisma.user.create({
      data: {
        username: u.username,
        email: u.email,
        password: 'hashed_password_placeholder',
        bio: Math.random() > 0.25 ? pick(BIOS) : '',
        profilePicture: '',
        createdAt: randomDate(180),
      },
    })
    users.push({ ...user, popular: u.popular })
  }

  // -- Posts --
  console.log('Seeding posts...')
  const postsInput = []
  for (const user of users) {
    const count = user.popular ? randomInt(8, 12) : randomInt(3, 6)
    for (let i = 0; i < count; i++) {
      postsInput.push({
        content: pick(POST_CONTENTS),
        authorId: user.id,
        createdAt: randomDate(180),
      })
    }
  }
  while (postsInput.length < 100) {
    postsInput.push({
      content: pick(POST_CONTENTS),
      authorId: pick(users).id,
      createdAt: randomDate(180),
    })
  }

  await prisma.post.createMany({ data: postsInput })
  const posts = await prisma.post.findMany()

  // -- Follows --
  console.log('Seeding follows...')
  const popularUsers = users.filter(u => u.popular)
  const followSet = new Set()
  const followsInput = []

  for (const user of users) {
    const count = user.popular ? randomInt(8, 14) : randomInt(3, 7)
    // Popular users appear first so everyone tends to follow them
    const prioritized = [
      ...popularUsers.filter(u => u.id !== user.id),
      ...shuffle(users.filter(u => u.id !== user.id && !u.popular)),
    ]
    let added = 0
    for (const target of prioritized) {
      if (added >= count) break
      const key = `${user.id}:${target.id}`
      if (!followSet.has(key)) {
        followSet.add(key)
        followsInput.push({
          followerId: user.id,
          followingId: target.id,
          createdAt: randomDate(180),
        })
        added++
      }
    }
  }
  await prisma.follow.createMany({ data: followsInput })

  // -- Likes --
  console.log('Seeding likes...')
  const likeSet = new Set()
  const likesInput = []
  for (const post of posts) {
    const count = randomInt(0, Math.min(15, users.length - 1))
    const candidates = shuffle(users.filter(u => u.id !== post.authorId))
    for (const liker of candidates.slice(0, count)) {
      const key = `${liker.id}:${post.id}`
      if (!likeSet.has(key)) {
        likeSet.add(key)
        likesInput.push({
          userId: liker.id,
          postId: post.id,
          createdAt: randomDate(180),
        })
      }
    }
  }
  await prisma.like.createMany({ data: likesInput })

  // -- Comments --
  console.log('Seeding comments...')
  const commentsInput = []
  while (commentsInput.length < 90) {
    const post = pick(posts)
    const author = pick(users.filter(u => u.id !== post.authorId))
    commentsInput.push({
      content: pick(COMMENT_CONTENTS),
      authorId: author.id,
      postId: post.id,
      createdAt: randomDate(180),
    })
  }
  await prisma.comment.createMany({ data: commentsInput })

  // -- Summary --
  console.log('\nSeeding complete ✓')
  console.log(`  Users:    ${users.length}`)
  console.log(`  Posts:    ${posts.length}`)
  console.log(`  Follows:  ${followsInput.length}`)
  console.log(`  Likes:    ${likesInput.length}`)
  console.log(`  Comments: ${commentsInput.length}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
