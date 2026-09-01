const crypto = require("crypto");
const { getStore } = require("@netlify/blobs");

const DEFAULTS = {
  companyName:"ZM Business Alliance",
  heroHeading:"YOUR BUSINESS, OUR NETWORK, GLOBAL IMPACT.",
  heroDescription:"Connecting businesses across India, UAE, and 40+ countries worldwide.",
  phone:"+91 8398802971",
  email:"zmbusinessalliance@gmail.com",
  instagram:"zmbusinessalliance",
  countries:"40+",
  partners:"500+",
  services:[
    {title:"Recruitment Solutions",description:"Connecting the right talent with the right opportunities — permanent, temporary and contract staffing."},
    {title:"Manpower Supply",description:"Skilled, semi-skilled and unskilled manpower for varied industries and business needs."},
    {title:"Digital Solutions",description:"Website development, branding, social media marketing, SEO and complete digital growth solutions."},
    {title:"Business Consultancy",description:"Strategy, planning, setup, operations and process improvement support."},
    {title:"Documentation Services",description:"PRO services, visa processing, company setup support, typing, attestation and document clearing."},
    {title:"Branding & Marketing",description:"Creative design, marketing campaigns and digital promotion to build stronger brands."}
  ],
  jobs:[
    {title:"Housemaid",description:"Cleaning, dusting and organizing."},
    {title:"Home Nurse",description:"Patient care, elderly assistance and medical needs."},
    {title:"Male/Female Nurse",description:"Clinical nursing, medical support and various settings."}
  ],
  posts:[],
  images:[
    {url:"assets/who-we-are.png",caption:"Who We Are"},
    {url:"assets/work-with-us.png",caption:"Work With Us"},
    {url:"assets/our-services.png",caption:"Our Services"},
    {url:"assets/job-vacancy.png",caption:"Job Vacancy"}
  ]
};

function secret(){return process.env.ADMIN_SESSION_SECRET || "CHANGE_THIS_SECRET_BEFORE_DEPLOY";}
function password(){return process.env.ADMIN_PASSWORD || "";}
function sign(payload){
  const data=Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig=crypto.createHmac("sha256",secret()).update(data).digest("base64url");
  return data+"."+sig;
}
function verify(t){
  if(!t)return null;
  const [data,sig]=t.split(".");
  if(!data||!sig)return null;
  const good=crypto.createHmac("sha256",secret()).update(data).digest("base64url");
  if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(good)))return null;
  const p=JSON.parse(Buffer.from(data,"base64url").toString());
  if(Date.now()>p.exp)return null;
  return p;
}
async function getData(){
  const store=getStore({name:"zm-site-data",consistency:"strong"});
  const x=await store.get("content",{type:"json"});
  return x || DEFAULTS;
}
async function saveData(patch){
  const store=getStore({name:"zm-site-data",consistency:"strong"});
  const old=await getData();
  const next={...old,...patch};
  await store.setJSON("content",next);
  return next;
}

exports.handler=async(event)=>{
  const headers={"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type, Authorization"};
  if(event.httpMethod==="OPTIONS")return{statusCode:204,headers};
  try{
    const body=event.body?JSON.parse(event.body):{};
    if(body.action==="login"){
      if(!password())return{statusCode:500,headers,body:JSON.stringify({ok:false,error:"ADMIN_PASSWORD is not configured in Netlify."})};
      if(body.password!==password())return{statusCode:401,headers,body:JSON.stringify({ok:false,error:"Invalid password."})};
      const token=sign({exp:Date.now()+1000*60*60*8});
      return{statusCode:200,headers,body:JSON.stringify({ok:true,token})};
    }
    const auth=event.headers.authorization||event.headers.Authorization||"";
    if(!verify(auth.replace(/^Bearer\s+/i,"")))return{statusCode:401,headers,body:JSON.stringify({ok:false,error:"Unauthorized. Please login again."})};
    if(body.action==="get")return{statusCode:200,headers,body:JSON.stringify({ok:true,data:await getData()})};
    if(body.action==="save"){
      const allowed=["companyName","heroHeading","heroDescription","phone","email","instagram","countries","partners","services","jobs","posts","images"];
      const patch={};
      for(const k of allowed)if(Object.prototype.hasOwnProperty.call(body.data||{},k))patch[k]=body.data[k];
      return{statusCode:200,headers,body:JSON.stringify({ok:true,data:await saveData(patch)})};
    }
    return{statusCode:400,headers,body:JSON.stringify({ok:false,error:"Unknown action."})};
  }catch(e){
    return{statusCode:500,headers,body:JSON.stringify({ok:false,error:e.message||"Server error."})};
  }
};