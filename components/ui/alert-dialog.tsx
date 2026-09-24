'use client';
import * as React from 'react';
import {AlertDialog as Primitive} from 'radix-ui';
import {cn} from 'cn';
export const AlertDialog=Primitive.Root;
export const AlertDialogTitle=Primitive.Title;
export const AlertDialogDescription=Primitive.Description;
export const AlertDialogAction=Primitive.Action;
export const AlertDialogCancel=Primitive.Cancel;
export function AlertDialogContent({className,...props}:React.ComponentProps<typeof Primitive.Content>){return <Primitive.Portal><Primitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0"/><Primitive.Content data-slot="dialog-content" className={cn('bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 duration-200 sm:max-w-lg',className)} {...props}/></Primitive.Portal>;}
