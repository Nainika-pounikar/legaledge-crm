// ─────────────────────────────────────────────────────────────────────────────
//  LegalEdge CRM  ·  Central Data Store
// ─────────────────────────────────────────────────────────────────────────────
export const OWNERS = ['Nainika Pounikar','Gaurav Dotonde','Bali Dondkar','Nikhil Lade','Styajit Galande','Subodh Badole'];
export const INDUSTRIES = ['Technology','Legal','Finance','Healthcare','Retail','Manufacturing','Education','Construction','Other'];

export function todayStr() { return new Date().toISOString().split('T')[0]; }
export function fmtINR(n)  { return '₹' + Number(n).toLocaleString('en-IN'); }
export function initials(name) { return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
export const AVATAR_COLORS = ['av-blue','av-green','av-purple','av-orange','av-red','av-teal'];

export const initialStore = {
  contacts: [
    {id:1,name:'Rahul Sharma',  email:'rahul.sharma@techcorp.in', phone:'+91-9876543210',company:'TechCorp India',     role:'CEO',      city:'Mumbai',    status:'active',  owner:'Nainika Pounikar', created:'2026-01-15',lastContact:'2026-03-01',type:'Customer',industry:'Technology',  priority:'High'},
    {id:2,name:'Priya Mehta',   email:'priya@legalsolutions.in',  phone:'+91-9871234560',company:'Legal Solutions Ltd',role:'Partner',  city:'Delhi',     status:'active',  owner:'Gaurav Dotonde',   created:'2026-01-20',lastContact:'2026-02-28',type:'Lead',    industry:'Legal',       priority:'High'},
    {id:3,name:'Amit Joshi',    email:'amit.joshi@finpro.in',     phone:'+91-9823456781',company:'FinPro Services',    role:'CFO',      city:'Pune',      status:'active',  owner:'Bali Dondkar',     created:'2026-02-01',lastContact:'2026-03-05',type:'Customer',industry:'Finance',      priority:'Medium'},
    {id:4,name:'Sunita Verma',  email:'sunita@medicare.in',       phone:'+91-9756789012',company:'MediCare Group',     role:'Director', city:'Hyderabad', status:'inactive',owner:'Nikhil Lade',       created:'2026-02-10',lastContact:'2026-02-15',type:'Prospect',industry:'Healthcare',   priority:'Low'},
    {id:5,name:'Karan Patel',   email:'karan.patel@retailco.in',  phone:'+91-9845671234',company:'RetailCo India',     role:'Manager',  city:'Ahmedabad', status:'active',  owner:'Styajit Galande',  created:'2026-02-15',lastContact:'2026-03-07',type:'Lead',    industry:'Retail',       priority:'Medium'},
    {id:6,name:'Meera Nair',    email:'meera@constructpro.in',    phone:'+91-9912345678',company:'ConstructPro',       role:'VP Sales', city:'Bangalore', status:'active',  owner:'Subodh Badole',    created:'2026-02-20',lastContact:'2026-03-08',type:'Customer',industry:'Construction', priority:'High'},
  ],
  leads: [
    {id:1,name:'Vijay Khanna', email:'vijay@startupx.in',   phone:'+91-9867890123',company:'StartupX',          source:'Website',       status:'New',         owner:'Nainika Pounikar', value:'2,50,000',created:'2026-03-01',temperature:'Hot', industry:'Technology',   notes:'Interested in enterprise plan'},
    {id:2,name:'Deepa Singh',  email:'deepa@lawfirm.in',    phone:'+91-9823456780',company:'Singh & Associates', source:'Referral',      status:'Contacted',   owner:'Gaurav Dotonde',   value:'1,80,000',created:'2026-03-02',temperature:'Warm',industry:'Legal',         notes:'Follow-up scheduled'},
    {id:3,name:'Rajesh Kumar', email:'rajesh@mfgco.in',     phone:'+91-9756780123',company:'MfgCo Industries',   source:'LinkedIn',      status:'Qualified',   owner:'Bali Dondkar',     value:'5,00,000',created:'2026-03-03',temperature:'Hot', industry:'Manufacturing', notes:'Budget approved'},
    {id:4,name:'Ananya Bose',  email:'ananya@edutech.in',   phone:'+91-9845670123',company:'EduTech Solutions',  source:'Email Campaign',status:'New',         owner:'Nikhil Lade',       value:'75,000',  created:'2026-03-04',temperature:'Cold',industry:'Education',     notes:'Initial inquiry'},
    {id:5,name:'Sachin Pawar', email:'sachin@healthplus.in',phone:'+91-9912340678',company:'HealthPlus',         source:'Event',         status:'Negotiation', owner:'Styajit Galande',  value:'3,50,000',created:'2026-03-05',temperature:'Warm',industry:'Healthcare',    notes:'Pricing discussion'},
  ],
  deals: [
    {id:1,name:'Legal Suite Enterprise',company:'TechCorp India',    contact:'Rahul Sharma', value:500000,stage:'Negotiation',owner:'Nainika Pounikar',closeDate:'2026-03-31',probability:75,created:'2026-01-15'},
    {id:2,name:'CRM Starter Pack',      company:'Legal Solutions Ltd',contact:'Priya Mehta',  value:150000,stage:'Proposal',   owner:'Gaurav Dotonde',  closeDate:'2026-04-15',probability:50,created:'2026-01-20'},
    {id:3,name:'Analytics Dashboard',   company:'FinPro Services',   contact:'Amit Joshi',   value:280000,stage:'Contacted',  owner:'Bali Dondkar',    closeDate:'2026-04-30',probability:30,created:'2026-02-01'},
    {id:4,name:'Premium Support Plan',  company:'MediCare Group',    contact:'Sunita Verma', value:120000,stage:'Closed Won', owner:'Nikhil Lade',     closeDate:'2026-02-28',probability:100,created:'2026-02-10'},
    {id:5,name:'Basic CRM License',     company:'RetailCo India',    contact:'Karan Patel',  value:60000, stage:'New Lead',   owner:'Styajit Galande', closeDate:'2026-05-01',probability:20,created:'2026-02-15'},
    {id:6,name:'Full Platform Bundle',  company:'ConstructPro',      contact:'Meera Nair',   value:750000,stage:'Proposal',   owner:'Subodh Badole',   closeDate:'2026-04-20',probability:60,created:'2026-02-20'},
    {id:7,name:'Audit Module',          company:'Singh & Associates',contact:'Deepa Singh',  value:90000, stage:'Closed Lost',owner:'Gaurav Dotonde',  closeDate:'2026-02-15',probability:0, created:'2026-01-25'},
  ],
  tasks: [
    {id:1,title:'Follow-up call with Priya Mehta',  type:'Call',    priority:'High',  dueDate:'2026-03-09',status:'Pending',    owner:'Nainika Pounikar',related:'Lead: Priya Mehta',           notes:'Discuss enterprise pricing'},
    {id:2,title:'Send proposal to TechCorp',        type:'Email',   priority:'High',  dueDate:'2026-03-10',status:'In Progress',owner:'Gaurav Dotonde',  related:'Deal: Legal Suite Enterprise', notes:'Include case studies'},
    {id:3,title:'Schedule demo with FinPro',        type:'Meeting', priority:'Medium',dueDate:'2026-03-11',status:'Pending',    owner:'Bali Dondkar',    related:'Contact: Amit Joshi',          notes:'Analytics dashboard demo'},
    {id:4,title:'Contract review - MediCare',       type:'Document',priority:'Low',   dueDate:'2026-03-15',status:'Completed',  owner:'Nikhil Lade',     related:'Deal: Premium Support Plan',   notes:'Final sign-off'},
    {id:5,title:'LinkedIn outreach - EduTech',      type:'Email',   priority:'Medium',dueDate:'2026-03-12',status:'Pending',    owner:'Styajit Galande', related:'Lead: Ananya Bose',            notes:'Connect and share brochure'},
    {id:6,title:'Site visit - ConstructPro',        type:'Meeting', priority:'High',  dueDate:'2026-03-14',status:'Pending',    owner:'Subodh Badole',   related:'Deal: Full Platform Bundle',   notes:'Meet VP Sales team'},
  ],
  activities: [
    { id: 1, entity: 'lead', entityId: 2, action: 'updated', detail: 'Lead Deepa Singh moved to Contacted stage', owner: 'Gaurav Dotonde', at: '2026-03-10T09:15:00.000Z' },
    { id: 2, entity: 'deal', entityId: 1, action: 'updated', detail: 'Deal Legal Suite Enterprise moved to Negotiation', owner: 'Nainika Pounikar', at: '2026-03-11T11:30:00.000Z' },
    { id: 3, entity: 'contact', entityId: 3, action: 'created', detail: 'Contact Amit Joshi created from qualified lead', owner: 'Bali Dondkar', at: '2026-03-12T14:45:00.000Z' },
  ],
  companies: [
    {id:1,name:'TechCorp India',    industry:'Technology',  size:'500-1000',city:'Mumbai',   website:'techcorp.in',    revenue:'50 Cr', contacts:3,deals:2,status:'Customer',owner:'Nainika Pounikar'},
    {id:2,name:'Legal Solutions Ltd',industry:'Legal',      size:'50-200',  city:'Delhi',    website:'legalsolutions.in',revenue:'15 Cr',contacts:2,deals:1,status:'Prospect',owner:'Gaurav Dotonde'},
    {id:3,name:'FinPro Services',   industry:'Finance',     size:'200-500', city:'Pune',     website:'finpro.in',      revenue:'30 Cr', contacts:1,deals:1,status:'Customer',owner:'Bali Dondkar'},
    {id:4,name:'MediCare Group',    industry:'Healthcare',  size:'1000+',   city:'Hyderabad',website:'medicare.in',    revenue:'200 Cr',contacts:2,deals:2,status:'Customer',owner:'Nikhil Lade'},
    {id:5,name:'RetailCo India',    industry:'Retail',      size:'100-500', city:'Ahmedabad',website:'retailco.in',    revenue:'80 Cr', contacts:1,deals:1,status:'Lead',    owner:'Styajit Galande'},
  ],
  tickets: [
    {id:1,title:'Cannot login to CRM',       contact:'Rahul Sharma',company:'TechCorp India',    priority:'High',  status:'Open',       created:'2026-03-07',owner:'Siddehesh Waske',    category:'Technical'},
    {id:2,title:'Invoice discrepancy',        contact:'Priya Mehta', company:'Legal Solutions Ltd',priority:'Medium',status:'In Progress',created:'2026-03-06',owner:'Dhananjay Chavan',  category:'Billing'},
    {id:3,title:'Feature request – bulk import',contact:'Amit Joshi',company:'FinPro Services',  priority:'Low',   status:'Open',       created:'2026-03-05',owner:'Umesh Suryawanshi', category:'Feature Request'},
    {id:4,title:'API integration help',       contact:'Meera Nair',  company:'ConstructPro',      priority:'High',  status:'Closed',     created:'2026-03-01',owner:'Siddehesh Waske',    category:'Technical'},
  ],
  callLogs: [
    {id:1,contact:'Rahul Sharma',phone:'+91-9876543210',duration:'8:32',status:'Answered',date:'2026-03-10',time:'10:15 AM',type:'Outbound',notes:'Discussed enterprise pricing'},
    {id:2,contact:'Priya Mehta', phone:'+91-9871234560',duration:'3:45',status:'Missed',  date:'2026-03-10',time:'11:30 AM',type:'Inbound', notes:''},
    {id:3,contact:'Amit Joshi',  phone:'+91-9823456781',duration:'12:08',status:'Answered',date:'2026-03-09',time:'02:00 PM',type:'Outbound',notes:'Demo scheduled for next week'},
    {id:4,contact:'Meera Nair',  phone:'+91-9912345678',duration:'5:20',status:'Answered',date:'2026-03-08',time:'04:30 PM',type:'Outbound',notes:'Contract review discussed'},
  ],
  meetings: [
    {id:1,title:'Product Demo – TechCorp',      type:'Video Call',date:'2026-03-12',time:'11:00 AM',contact:'Rahul Sharma',duration:'1 hour',platform:'zoom', notes:'Full platform demo'},
    {id:2,title:'Pricing Discussion – FinPro',  type:'Meeting',   date:'2026-03-14',time:'03:00 PM',contact:'Amit Joshi',  duration:'45 min', platform:'gmeet',notes:'Discuss enterprise pricing'},
    {id:3,title:'Onboarding Kickoff – MediCare',type:'Video Call',date:'2026-03-18',time:'10:00 AM',contact:'Sunita Verma',duration:'1 hour',platform:'teams',notes:'Welcome and setup'},
  ],
  inbox: [
    {id:1,from:'Rahul Sharma',email:'rahul.sharma@techcorp.in',subject:'Re: LegalEdge Enterprise Proposal',   preview:'Thank you for sending over the proposal. The team has reviewed and we have a few questions about the pricing structure...',time:'10:32 AM',  unread:true, tag:'Deal'},
    {id:2,from:'Priya Mehta', email:'priya@legalsolutions.in',  subject:'Meeting follow-up',                  preview:'Following up on our meeting yesterday. I wanted to confirm the next steps we discussed regarding the CRM implementation...',time:'09:15 AM',  unread:true, tag:'Lead'},
    {id:3,from:'Amit Joshi',  email:'amit.joshi@finpro.in',     subject:'Analytics Dashboard Enquiry',        preview:'Hi, we are interested in the analytics module. Could you please share more details about the dashboard features?',              time:'Yesterday',unread:false,tag:'Prospect'},
    {id:4,from:'System',      email:'noreply@legaledge.in',     subject:'New Lead Alert: Sachin Pawar',       preview:'A new lead has been added to your pipeline. Sachin Pawar from HealthPlus has been assigned to you.',                         time:'Yesterday',unread:true, tag:'System'},
    {id:5,from:'Meera Nair',  email:'meera@constructpro.in',    subject:'Contract Status Update',             preview:'Just wanted to check in on the contract status. Our legal team has approved the terms and we are ready to proceed...',        time:'2 days ago',unread:false,tag:'Customer'},
  ],
  products:      [{id:1,name:'CRM Starter Pack',  sku:'CRM-001',price:4999, category:'Software',stock:'Unlimited',status:'Active',description:'Basic CRM for small teams'},{id:2,name:'CRM Professional',sku:'CRM-002',price:12999,category:'Software',stock:'Unlimited',status:'Active',description:'Advanced CRM with analytics'},{id:3,name:'Enterprise Bundle',  sku:'CRM-003',price:39999,category:'Software',stock:'Unlimited',status:'Active',description:'Full platform for enterprises'},{id:4,name:'Onboarding Service',sku:'SVC-001',price:9999, category:'Service', stock:'10',      status:'Active',description:'1-month onboarding assistance'},{id:5,name:'Data Migration',     sku:'SVC-002',price:14999,category:'Service', stock:'5',       status:'Active',description:'Migrate from existing CRM'}],
  quotes:        [{id:1,title:'Q-2026-001',contact:'Rahul Sharma',company:'TechCorp India',    amount:499900,status:'Sent',    created:'2026-03-01',expiry:'2026-03-31',owner:'Nainika Pounikar'},{id:2,title:'Q-2026-002',contact:'Priya Mehta',company:'Legal Solutions Ltd',amount:149900,status:'Draft',   created:'2026-03-03',expiry:'2026-04-03',owner:'Gaurav Dotonde'},{id:3,title:'Q-2026-003',contact:'Meera Nair',company:'ConstructPro',      amount:749900,status:'Accepted',created:'2026-02-20',expiry:'2026-03-20',owner:'Subodh Badole'}],
  invoices:      [{id:1,number:'INV-2026-001',contact:'Rahul Sharma',company:'TechCorp India',  amount:499900,status:'Paid',   due:'2026-03-15',issued:'2026-03-01'},{id:2,number:'INV-2026-002',contact:'Meera Nair', company:'ConstructPro',    amount:749900,status:'Pending',due:'2026-03-25',issued:'2026-03-05'},{id:3,number:'INV-2026-003',contact:'Amit Joshi', company:'FinPro Services',  amount:129900,status:'Overdue',due:'2026-02-28',issued:'2026-02-01'}],
  orders:        [{id:1,number:'ORD-001',customer:'TechCorp India',contact:'Rahul Sharma',product:'Enterprise Bundle',  amount:499900,status:'Fulfilled', date:'2026-03-01'},{id:2,number:'ORD-002',customer:'ConstructPro',  contact:'Meera Nair',  product:'CRM Professional',amount:149900,status:'Processing',date:'2026-03-05'},{id:3,number:'ORD-003',customer:'FinPro Services',contact:'Amit Joshi', product:'Onboarding Service',amount:99900, status:'Pending',   date:'2026-03-07'}],
  payments:      [{id:1,ref:'PAY-001',from:'TechCorp India',  amount:499900,method:'Bank Transfer',status:'Completed',date:'2026-03-03'},{id:2,ref:'PAY-002',from:'ConstructPro',  amount:249900,method:'UPI',         status:'Completed',date:'2026-03-06'},{id:3,ref:'PAY-003',from:'MediCare Group',amount:120000,method:'Cheque',      status:'Processing',date:'2026-03-08'}],
  subscriptions: [{id:1,customer:'TechCorp India',    plan:'Enterprise',  amount:39999,billing:'Monthly',status:'Active',renewal:'2026-04-01'},{id:2,customer:'Legal Solutions Ltd',plan:'Professional',amount:12999,billing:'Monthly',status:'Active',renewal:'2026-04-05'},{id:3,customer:'MediCare Group',    plan:'Enterprise',  amount:39999,billing:'Annual', status:'Active',renewal:'2027-01-01'}],
  playbooks: [
    {id:1,name:'Initial Discovery Call',    category:'Sales',  steps:['Introduce yourself & LegalEdge','Ask about current CRM pain points','Identify decision makers','Qualify budget & timeline','Schedule follow-up demo'],used:34},
    {id:2,name:'Product Demo Script',       category:'Sales',  steps:['Demo dashboard & KPIs','Show contact management','Walk through deal pipeline','Highlight automation features','Address objections','Propose next steps'],used:28},
    {id:3,name:'Objection Handling Guide',  category:'Sales',  steps:['Listen completely before responding','Acknowledge the concern','Ask clarifying questions','Present counter-evidence','Confirm resolution'],used:19},
    {id:4,name:'Onboarding Checklist',      category:'Success',steps:['Send welcome email','Schedule kickoff call','Data migration walkthrough','Team training session','30-day check-in'],used:12},
  ],
  templates: [
    {id:1,name:'Welcome Email',      subject:'Welcome to LegalEdge CRM!',                          preview:"Hi {{first_name}}, We're excited to have you on board...", tags:['Onboarding','Welcome'],used:45},
    {id:2,name:'Follow-up After Demo',subject:'Thank you for your time, {{first_name}}',           preview:'Hi {{first_name}}, It was great speaking with you today...',tags:['Sales','Follow-up'],  used:38},
    {id:3,name:'Proposal Email',     subject:'LegalEdge CRM Proposal for {{company}}',             preview:'Dear {{first_name}}, Please find attached the proposal...',tags:['Sales','Proposal'],   used:22},
    {id:4,name:'Invoice Reminder',   subject:'Invoice #{{invoice_number}} Due Soon',               preview:'Hi {{first_name}}, This is a gentle reminder...',          tags:['Billing','Reminder'], used:17},
    {id:5,name:'Support Response',   subject:'Re: {{ticket_subject}} – Ticket #{{ticket_id}}',    preview:'Hi {{first_name}}, Thank you for reaching out...',          tags:['Support','Service'],  used:29},
  ],
  snippets: [
    {id:1,shortcut:'#intro',  name:'Introduction',text:"Hi, I'm from LegalEdge CRM. We help businesses manage their customer relationships and sales pipeline with an intuitive, powerful platform."},
    {id:2,shortcut:'#pricing',name:'Pricing Info', text:'Our plans start at ₹4,999/month for Starter. Professional at ₹12,999/month and Enterprise at ₹39,999/month with full feature access.'},
    {id:3,shortcut:'#demo',   name:'Demo CTA',     text:'Would you like to schedule a personalized demo? I can walk you through how LegalEdge CRM can help specifically with your use case.'},
    {id:4,shortcut:'#thanks', name:'Thank You',    text:'Thank you for your time and consideration. I look forward to speaking with you. Please feel free to reach out anytime.'},
  ],
  documents: [
    {id:1,name:'LegalEdge CRM Brochure.pdf',        type:'PDF', size:'2.4 MB',views:34,created:'2026-02-01',owner:'Shailesh Bhange'},
    {id:2,name:'Enterprise Proposal Template.docx',  type:'Word',size:'1.2 MB',views:18,created:'2026-02-10',owner:'Nainika Pounikar'},
    {id:3,name:'Onboarding Guide.pdf',               type:'PDF', size:'4.1 MB',views:52,created:'2026-01-15',owner:'Gaurav Dotonde'},
    {id:4,name:'Case Study – TechCorp.pdf',          type:'PDF', size:'1.8 MB',views:28,created:'2026-03-01',owner:'Bali Dondkar'},
  ],
  blogs: [
    {id:1,title:'5 Ways CRM Improves Sales Performance',  status:'Published', author:'Shailesh Bhange', date:'2026-02-15',views:1240,category:'Sales'},
    {id:2,title:'How to Track Leads Effectively',         status:'Published', author:'Nainika Pounikar',date:'2026-02-28',views:890, category:'CRM Tips'},
    {id:3,title:'LegalEdge CRM vs Competitors',          status:'Draft',     author:'Gaurav Dotonde',  date:'2026-03-05',views:0,   category:'Product'},
    {id:4,title:'Automation Best Practices',              status:'Scheduled', author:'Bali Dondkar',    date:'2026-03-15',views:0,   category:'Automation'},
  ],
  coachingPlaylists: [
    {id:1,name:'New Sales Rep Onboarding',     videos:8, duration:'3h 20m',category:'Onboarding',owner:'Shailesh Bhange',assigned:6},
    {id:2,name:'Advanced Negotiation Skills',  videos:5, duration:'2h 10m',category:'Skills',    owner:'Gaurav Dotonde',  assigned:4},
    {id:3,name:'Product Knowledge Deep Dive',  videos:12,duration:'5h 40m',category:'Product',   owner:'Nikhil Lade',     assigned:9},
  ],
  connectedApps: [
    {name:'Gmail',            icon:'fa-envelope',  category:'Email',     status:'Connected',    since:'2026-01-01'},
    {name:'Google Calendar',  icon:'fa-calendar',  category:'Calendar',  status:'Connected',    since:'2026-01-01'},
    {name:'Slack',            icon:'fa-comment',   category:'Messaging', status:'Connected',    since:'2026-01-15'},
    {name:'Zoom',             icon:'fa-video',     category:'Video',     status:'Connected',    since:'2026-02-01'},
    {name:'WhatsApp Business',icon:'fa-phone',     category:'Messaging', status:'Not Connected',since:null},
    {name:'Razorpay',         icon:'fa-credit-card',category:'Payments', status:'Connected',    since:'2026-01-10'},
    {name:'Tally',            icon:'fa-chart-bar', category:'Accounting',status:'Not Connected',since:null},
    {name:'IndiaMART',        icon:'fa-store',     category:'Leads',     status:'Not Connected',since:null},
  ],
};
