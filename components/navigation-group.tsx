'use client';

import type {ReactNode} from 'react';
import {ChevronRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Collapsible,CollapsibleContent,CollapsibleTrigger} from '@/components/ui/collapsible';

export function NavigationGroup({label,mobile,open,onOpenChange,className='nav-group',children}:{
 label:string;
 mobile:boolean;
 open:boolean;
 onOpenChange:(open:boolean)=>void;
 className?:string;
 children:ReactNode;
}){
 if(!mobile)return <div className={className}><p className="nav-label">{label}</p>{children}</div>;
 return <Collapsible className={className} open={open} onOpenChange={onOpenChange}>
  <CollapsibleTrigger asChild>
   <Button variant="ghost" className="nav-group-trigger">
    <span>{label}</span><ChevronRight aria-hidden="true"/>
   </Button>
  </CollapsibleTrigger>
  <CollapsibleContent>{children}</CollapsibleContent>
 </Collapsible>;
}
