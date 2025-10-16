const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const users = [];
const projects = [];
const hackathons = [
  { id: 1, name: "Mista Hackathon Alpha", start: "2025-11-01", meetings: ["https://meet.google.com/test1"], stats: { submitted: 0 } },
  { id: 2, name: "Mista Hackathon Beta", start: "2025-12-01", meetings: ["https://meet.google.com/test2"], stats: { submitted: 0 } }
];

// Register/Login
app.post('/register', (req,res)=>{
  const { name, email, password } = req.body;
  if(users.find(u=>u.email===email)) return res.status(400).json({ error:"Email exists"});
  users.push({ name, email, password, hackathons:[], projects:[] });
  res.json({ user: { name, email } });
});
app.post('/login', (req,res)=>{
  const { email, password } = req.body;
  const user = users.find(u=>u.email===email && u.password===password);
  if(!user) return res.status(400).json({ error:"Invalid login"});
  res.json({ user: { name: user.name, email: user.email } });
});

// Project Submission
app.post('/submit', upload.single('file'), (req,res)=>{
  const { email, hackathonId, team, title, description, link } = req.body;
  const project = { hackathonId, team, title, description, link, file:req.file?req.file.filename:"", email, timestamp:Date.now() };
  projects.push(project);
  let user = users.find(u=>u.email===email);
  if(user){ user.projects.push(project); user.hackathons.push(Number(hackathonId)); }
  let hackathon = hackathons.find(h=>h.id===Number(hackathonId));
  if(hackathon){ hackathon.stats.submitted += 1; }
  res.json({ message:"Submitted!", project });
});

// APIs for dashboard
app.get('/hackathons',(req,res)=>res.json(hackathons));
app.get('/projects',(req,res)=>res.json(projects));
app.get('/stats/:email',(req,res)=>{
  const user = users.find(u=>u.email===req.params.email);
  if(!user) return res.status(404).json({ error: "User not found" });
  const participation = user.hackathons.length;
  const totalProjects = user.projects.length;
  const submissions = user.projects.map(p=>({title:p.title, date:new Date(p.timestamp).toLocaleDateString()}));
  res.json({ participation, totalProjects, submissions });
});
app.use('/uploads', express.static('uploads'));

app.listen(5000,()=>console.log("Backend running on 5000"));
