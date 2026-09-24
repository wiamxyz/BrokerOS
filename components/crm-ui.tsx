'use client';
import { ReactNode } from 'react';
import { Search, ArrowUpRight, CircleCheck, Sparkles, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Priority } from '@/lib/model';
export function Pill({children,tone='neutral'}:{children:ReactNode;tone?:string}){return <Badge variant="outline" className={`pill ${tone}`}>{children}</Badge>;}
export function PriorityPill({priority}:{priority:Priority}){return <Pill tone={priority.toLowerCase()}>{priority==='Closing'?'Ready to close':priority==='Listing'?'Win a listing':'Nurture'}</Pill>;}
export function Avatar({name,small=false}:{name:string;small?:boolean}){const tone=name.charCodeAt(0)%4;return <span aria-hidden="true" className={`avatar avatar-${tone} ${small?'small':''}`}>{name.split(' ').map(n=>n[0]).slice(0,2).join('')}</span>;}
export function Picker({label,value,onChange,options,name}:{label:string;value?:string;onChange?:(v:string)=>void;options:readonly string[];name?:string}){return <Select name={name} value={value} onValueChange={onChange} defaultValue={value?undefined:options[0]}><SelectTrigger aria-label={label} className="picker"><SelectValue placeholder={label}/></SelectTrigger><SelectContent>{options.map(o=><SelectItem value={o} key={o}>{o}</SelectItem>)}</SelectContent></Select>;}
export function Field({label,children}:{label:string;children:ReactNode}){return <div className="field"><Label>{label}</Label>{children}</div>;}
export function SearchInput({value,onChange,placeholder='Search contacts…'}:{value:string;onChange:(v:string)=>void;placeholder?:string}){return <div className="search-input"><Search size={17}/><Input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/></div>;}
export function Empty({title,description,action}:{title:string;description:string;action?:ReactNode}){return <div className="empty-state"><Inbox size={28}/><h3>{title}</h3><p>{description}</p>{action}</div>;}
export function Metric({label,value,hint,icon,onClick,tone='neutral'}:{label:string;value:string|number;hint:string;icon:ReactNode;onClick?:()=>void;tone?:string}){return <Card className={`metric ${tone}`}><CardContent><div className="metric-label">{label}{icon}</div><strong>{value}</strong><div className="metric-bottom"><span>{hint}</span>{onClick&&<Button size="icon-sm" variant="ghost" aria-label={`View ${label.toLowerCase()}`} onClick={onClick}><ArrowUpRight/></Button>}</div></CardContent></Card>;}
export function SectionTitle({title,aside,icon}:{title:string;aside?:ReactNode;icon?:ReactNode}){return <div className="section-title"><h2>{icon}{title}</h2>{aside}</div>;}
export function DemoNote({children}:{children?:ReactNode}){return <div className="demo-note"><Sparkles size={14}/><span>{children||'Demo workspace · fictional contacts and illustrative figures · changes saved in this browser'}</span></div>;}
export function CheckButton({checked,onClick,label}:{checked:boolean;onClick:()=>void;label:string}){return <Button variant="ghost" size="icon-sm" className={`task-check ${checked?'checked':''}`} onClick={onClick} aria-label={label} aria-pressed={checked}>{checked?<CircleCheck size={21}/>:<span className="circle-check"/>}</Button>;}
