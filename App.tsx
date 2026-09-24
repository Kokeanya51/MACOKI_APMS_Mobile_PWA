import { useMemo, useState } from "react";
import {
  Activity, CalendarDays, ClipboardPlus, FileText, Home, LogOut,
  Menu, Plus, Search, Settings, Stethoscope, UserRound, Users, X
} from "lucide-react";
import { AppData, FollowUp, Patient, Role, Visit } from "./types";
import { loadData, makeId, saveData } from "./storage";

type Page = "Dashboard" | "Patients" | "Visits" | "Follow-ups" | "Reports" | "Settings";

const roles: Role[] = ["Super Admin", "Pharmacist", "Lab Staff", "Reception"];

export function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [page, setPage] = useState<Page>("Dashboard");
  const [role, setRole] = useState<Role>("Super Admin");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [patientModal, setPatientModal] = useState(false);
  const [visitModal, setVisitModal] = useState(false);
  const [followModal, setFollowModal] = useState(false);

  function update(next: AppData) {
    setData(next);
    saveData(next);
  }

  const filteredPatients = useMemo(
    () => data.patients.filter(p => `${p.name} ${p.phone} ${p.id}`.toLowerCase().includes(query.toLowerCase())),
    [data.patients, query]
  );

  function addPatient(form: Omit<Patient, "id" | "createdAt">) {
    update({ ...data, patients: [{ ...form, id: makeId("P"), createdAt: new Date().toISOString() }, ...data.patients] });
    setPatientModal(false);
  }

  function addVisit(form: Omit<Visit, "id">) {
    update({ ...data, visits: [{ ...form, id: makeId("V") }, ...data.visits] });
    setVisitModal(false);
  }

  function addFollowUp(form: Omit<FollowUp, "id">) {
    update({ ...data, followups: [{ ...form, id: makeId("F") }, ...data.followups] });
    setFollowModal(false);
  }

  const nav = [
    ["Dashboard", Home], ["Patients", Users], ["Visits", Stethoscope],
    ["Follow-ups", CalendarDays], ["Reports", FileText], ["Settings", Settings]
  ] as const;

  return (
    <div className="app">
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand">
          <div className="brandMark">M</div>
          <div><strong>MaCoKi</strong><small>Patient Management</small></div>
          <button className="closeMenu" onClick={() => setMenu(false)}><X size={20}/></button>
        </div>
        <nav>
          {nav.map(([label, Icon]) => (
            <button className={page === label ? "nav active" : "nav"} onClick={() => {setPage(label);setMenu(false)}} key={label}>
              <Icon size={19}/><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebarBottom">
          <div className="rolePill"><UserRound size={17}/><span>{role}</span></div>
          <button className="nav"><LogOut size={19}/><span>Sign out</span></button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="iconBtn mobileOnly" onClick={() => setMenu(true)}><Menu/></button>
          <div>
            <div className="eyebrow">MaCoKi APMS</div>
            <h1>{page}</h1>
          </div>
          <div className="topActions">
            <select value={role} onChange={e => setRole(e.target.value as Role)}>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </header>

        {page === "Dashboard" && <Dashboard data={data} onPatients={() => setPage("Patients")} onVisit={() => setVisitModal(true)} />}
        {page === "Patients" && (
          <section>
            <div className="sectionHead">
              <div><h2>Patients</h2><p>Register and manage patient records.</p></div>
              <button className="primary" onClick={() => setPatientModal(true)}><Plus size={18}/> New patient</button>
            </div>
            <div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, phone or patient ID"/></div>
            <div className="tableCard">
              <div className="tableHead"><span>Patient</span><span>Phone</span><span>Sex</span><span>Blood</span></div>
              {filteredPatients.map(p => <div className="tableRow" key={p.id}>
                <div><strong>{p.name}</strong><small>{p.id}</small></div><span>{p.phone}</span><span>{p.sex}</span><span>{p.bloodGroup}</span>
              </div>)}
              {!filteredPatients.length && <Empty text="No patients found."/>}
            </div>
          </section>
        )}

        {page === "Visits" && <Visits data={data} onAdd={() => setVisitModal(true)}/>}
        {page === "Follow-ups" && <Followups data={data} onAdd={() => setFollowModal(true)} onComplete={(id) => update({...data, followups:data.followups.map(f=>f.id===id?{...f,status:"Completed"}:f)})}/>}
        {page === "Reports" && <Reports data={data}/>}
        {page === "Settings" && <SettingsPage role={role} setRole={setRole}/>}
      </main>

      {patientModal && <PatientModal onClose={()=>setPatientModal(false)} onSave={addPatient}/>}
      {visitModal && <VisitModal patients={data.patients} onClose={()=>setVisitModal(false)} onSave={addVisit}/>}
      {followModal && <FollowModal patients={data.patients} onClose={()=>setFollowModal(false)} onSave={addFollowUp}/>}
    </div>
  );
}

function Dashboard({data,onPatients,onVisit}:{data:AppData;onPatients:()=>void;onVisit:()=>void}) {
  const pending = data.followups.filter(f=>f.status==="Pending").length;
  return <section>
    <div className="hero"><div><span className="badge">MOBILE PWA</span><h2>Welcome to MaCoKi APMS</h2><p>Fast patient registration, visits, records and follow-up management from your phone.</p></div><Activity size={52}/></div>
    <div className="stats">
      <Stat icon={<Users/>} label="Patients" value={data.patients.length}/>
      <Stat icon={<Stethoscope/>} label="Visits" value={data.visits.length}/>
      <Stat icon={<CalendarDays/>} label="Pending follow-ups" value={pending}/>
      <Stat icon={<ClipboardPlus/>} label="Records" value={data.patients.length + data.visits.length}/>
    </div>
    <div className="quick">
      <button onClick={onPatients}><Users/><span><b>Patient registration</b><small>Create a new patient record</small></span></button>
      <button onClick={onVisit}><Stethoscope/><span><b>Record visit</b><small>Capture complaint and assessment</small></span></button>
    </div>
  </section>
}
function Stat({icon,label,value}:{icon:React.ReactNode;label:string;value:number}){return <div className="stat"><div className="statIcon">{icon}</div><div><strong>{value}</strong><small>{label}</small></div></div>}
function Empty({text}:{text:string}){return <div className="empty">{text}</div>}

function Visits({data,onAdd}:{data:AppData;onAdd:()=>void}) {
  return <section><div className="sectionHead"><div><h2>Clinical visits</h2><p>Visit history and clinical notes.</p></div><button className="primary" onClick={onAdd}><Plus size={18}/> Record visit</button></div>
    <div className="cards">{data.visits.map(v=>{const p=data.patients.find(x=>x.id===v.patientId);return <article className="recordCard" key={v.id}><div className="recordTop"><b>{p?.name || "Unknown patient"}</b><span>{v.date}</span></div><p><strong>Complaint:</strong> {v.complaint}</p><p><strong>Assessment:</strong> {v.assessment || "—"}</p><p><strong>Treatment:</strong> {v.treatment || "—"}</p><small>Clinician: {v.clinician}</small></article>})}</div>
    {!data.visits.length && <Empty text="No visits recorded yet."/>}
  </section>
}

function Followups({data,onAdd,onComplete}:{data:AppData;onAdd:()=>void;onComplete:(id:string)=>void}) {
  return <section><div className="sectionHead"><div><h2>Follow-ups</h2><p>Track scheduled patient follow-up care.</p></div><button className="primary" onClick={onAdd}><Plus size={18}/> Add follow-up</button></div>
    <div className="cards">{data.followups.map(f=>{const p=data.patients.find(x=>x.id===f.patientId);return <article className="recordCard" key={f.id}><div className="recordTop"><b>{p?.name || "Unknown patient"}</b><span className={f.status==="Pending"?"pending":"done"}>{f.status}</span></div><p><strong>Date:</strong> {f.date}</p><p><strong>Reason:</strong> {f.reason}</p>{f.status==="Pending"&&<button className="secondary" onClick={()=>onComplete(f.id)}>Mark completed</button>}</article>})}</div>
    {!data.followups.length && <Empty text="No follow-ups scheduled."/>}
  </section>
}

function Reports({data}:{data:AppData}) {
  return <section><div className="sectionHead"><div><h2>Reports</h2><p>Quick operational summary for the clinic.</p></div></div>
    <div className="reportGrid"><div><span>Total patients</span><b>{data.patients.length}</b></div><div><span>Total visits</span><b>{data.visits.length}</b></div><div><span>Pending follow-ups</span><b>{data.followups.filter(f=>f.status==="Pending").length}</b></div><div><span>Completed follow-ups</span><b>{data.followups.filter(f=>f.status==="Completed").length}</b></div></div>
    <div className="notice"><FileText/><div><b>Production note</b><p>This PWA currently stores demo data in the browser. Connect it to the MaCoKi Django REST API + PostgreSQL before using it for real patient records.</p></div></div>
  </section>
}

function SettingsPage({role,setRole}:{role:Role;setRole:(r:Role)=>void}) {
  return <section><div className="sectionHead"><div><h2>Settings</h2><p>Basic mobile configuration.</p></div></div>
    <div className="formCard"><label>Active demo role<select value={role} onChange={e=>setRole(e.target.value as Role)}>{roles.map(r=><option key={r}>{r}</option>)}</select></label>
    <div className="notice"><Settings/><div><b>Planned production architecture</b><p>React + TypeScript + Vite mobile frontend → protected Django REST Framework API → PostgreSQL, with role-based permissions for Super Admin, Pharmacist and Lab Staff.</p></div></div></div>
  </section>
}

function Modal({title,children,onClose}:{title:string;children:React.ReactNode;onClose:()=>void}){return <div className="overlay"><div className="modal"><div className="modalHead"><h3>{title}</h3><button className="iconBtn" onClick={onClose}><X/></button></div>{children}</div></div>}

function PatientModal({onClose,onSave}:{onClose:()=>void;onSave:(p:Omit<Patient,"id"|"createdAt">)=>void}) {
 const [f,setF]=useState({name:"",phone:"",sex:"Female" as Patient["sex"],dob:"",address:"",bloodGroup:"",genotype:"",allergies:""});
 return <Modal title="Register patient" onClose={onClose}><form onSubmit={e=>{e.preventDefault();if(!f.name||!f.phone)return;onSave(f)}}><Input label="Full name" value={f.name} set={v=>setF({...f,name:v})}/><Input label="Phone" value={f.phone} set={v=>setF({...f,phone:v})}/><div className="two"><Input label="Date of birth" type="date" value={f.dob} set={v=>setF({...f,dob:v})}/><label>Sex<select value={f.sex} onChange={e=>setF({...f,sex:e.target.value as Patient["sex"]})}><option>Female</option><option>Male</option><option>Other</option></select></label></div><Input label="Address" value={f.address} set={v=>setF({...f,address:v})}/><div className="two"><Input label="Blood group" value={f.bloodGroup} set={v=>setF({...f,bloodGroup:v})}/><Input label="Genotype" value={f.genotype} set={v=>setF({...f,genotype:v})}/></div><Input label="Allergies" value={f.allergies} set={v=>setF({...f,allergies:v})}/><button className="primary full">Save patient</button></form></Modal>
}

function VisitModal({patients,onClose,onSave}:{patients:Patient[];onClose:()=>void;onSave:(v:Omit<Visit,"id">)=>void}) {
 const [f,setF]=useState({patientId:patients[0]?.id||"",date:new Date().toISOString().slice(0,10),complaint:"",assessment:"",treatment:"",clinician:""});
 return <Modal title="Record clinical visit" onClose={onClose}><form onSubmit={e=>{e.preventDefault();if(f.patientId&&f.complaint)onSave(f)}}><label>Patient<select value={f.patientId} onChange={e=>setF({...f,patientId:e.target.value})}>{patients.map(p=><option key={p.id} value={p.id}>{p.name} — {p.id}</option>)}</select></label><Input label="Visit date" type="date" value={f.date} set={v=>setF({...f,date:v})}/><Text label="Chief complaint" value={f.complaint} set={v=>setF({...f,complaint:v})}/><Text label="Assessment" value={f.assessment} set={v=>setF({...f,assessment:v})}/><Text label="Treatment / plan" value={f.treatment} set={v=>setF({...f,treatment:v})}/><Input label="Clinician" value={f.clinician} set={v=>setF({...f,clinician:v})}/><button className="primary full">Save visit</button></form></Modal>
}

function FollowModal({patients,onClose,onSave}:{patients:Patient[];onClose:()=>void;onSave:(f:Omit<FollowUp,"id">)=>void}) {
 const [f,setF]=useState({patientId:patients[0]?.id||"",date:"",reason:"",status:"Pending" as FollowUp["status"]});
 return <Modal title="Schedule follow-up" onClose={onClose}><form onSubmit={e=>{e.preventDefault();if(f.patientId&&f.date&&f.reason)onSave(f)}}><label>Patient<select value={f.patientId} onChange={e=>setF({...f,patientId:e.target.value})}>{patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><Input label="Follow-up date" type="date" value={f.date} set={v=>setF({...f,date:v})}/><Text label="Reason" value={f.reason} set={v=>setF({...f,reason:v})}/><button className="primary full">Schedule</button></form></Modal>
}

function Input({label,value,set,type="text"}:{label:string;value:string;set:(v:string)=>void;type?:string}){return <label>{label}<input required type={type} value={value} onChange={e=>set(e.target.value)}/></label>}
function Text({label,value,set}:{label:string;value:string;set:(v:string)=>void}){return <label>{label}<textarea value={value} onChange={e=>set(e.target.value)}/></label>}
