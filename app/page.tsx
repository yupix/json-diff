"use client";

import React, { useState } from 'react';

import CodeEditor from '@uiw/react-textarea-code-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KeyDiff {
  added: { key: string; value: any; type: string[] }[];
  removed: string[];
  differentTypes: { key: string; type: string[] }[];
}

function getType(obj: any): string {
  if (obj === null) {
    return 'None';
  }
  const mapping = {
    'string': 'str',
    'number': 'int',
    'boolean': 'bool',
    'object': 'dict',
    'array': 'list',
  }
  return mapping[typeof obj] || typeof obj;
}

function createTypedDict(datas: {key: string, type: string[]}[]) {
  let typedDict = "class Data(TypedDict):\n";
  for (const {key, type} of datas) {
    const snakeCaseKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    typedDict += `  ${snakeCaseKey}: ${type.toString().replace(',', ' | ')}\n`;
  }
  return typedDict;
}

function getKeyDiff(obj1: any, obj2: any): KeyDiff {
  const added: { key: string; value: any; type: string[] }[] = [];
  const removed: string[] = [];
  const differentTypes: { key: string; type: string[] }[] = [];

  if (obj1 !== null && obj2 !== null) {
    for (const key in obj1) {
      if (!(key in obj2)) {
        removed.push(key);
      } else if (getType(obj1[key]) !== getType(obj2[key])) {
        differentTypes.push({ key, type: [getType(obj1[key]), getType(obj2[key])]});
      }
    }

    for (const key in obj2) {
      if (!(key in obj1)) {
        added.push({ key, value: obj2[key], type: [getType(obj2[key])] });
      }
    }
  }

  return { added, removed, differentTypes };
}
export default function Home() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');

  let obj1: any = null;
  let obj2: any = null;

  try {
    obj1 = JSON.parse(text1);
  } catch (e) {}

  try {
    obj2 = JSON.parse(text2);
  } catch (e) {}

  const { added, removed, differentTypes } = getKeyDiff(obj1, obj2);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full">
        <div className="grid grid-cols-3 gap-10">
          <div className='shadow-sm bg-gray-100'>
            <label htmlFor="before">before</label>
            <CodeEditor name="before" value={text1} onChange={(e) => setText1(e.target.value)} language='json'/>
          </div>
          <div className='shadow-sm bg-gray-100'>
            <label htmlFor='after'>after</label>
            <CodeEditor name="after" value={text2} onChange={(e) => setText2(e.target.value)} language='json'/>
          </div>
          <div className='shadow-sm bg-gray-100'>
            <div>追加されたキー</div>
            <Tabs defaultValue='Json' className='w-[400px]'>
              <TabsList>
                <TabsTrigger value="Json">JSON</TabsTrigger>
                <TabsTrigger value="TypedDict">TypedDict</TabsTrigger>
              </TabsList>
              <TabsContent value="Json">
              <CodeEditor value={JSON.stringify(added, null, 4)} language="python"></CodeEditor>
              </TabsContent>
              
              
              <TabsContent value="TypedDict">
              <CodeEditor value={createTypedDict(added)} language="python"></CodeEditor>
              </TabsContent>
            </Tabs>
            
            <div>削除されたキー</div>
            <CodeEditor value={JSON.stringify(removed, null, 4)} language="json"></CodeEditor>
            <div>型が異なるキー</div>
            <Tabs defaultValue='Json' className='w-[400px]'>
              <TabsList>
                <TabsTrigger value="Json">JSON</TabsTrigger>
                <TabsTrigger value="TypedDict">TypedDict</TabsTrigger>
              </TabsList>
              <TabsContent value="Json">
              <CodeEditor value={JSON.stringify(differentTypes, null, 4)} language="python"></CodeEditor>
              </TabsContent>
              
              
              <TabsContent value="TypedDict">
              <CodeEditor value={createTypedDict(differentTypes)} language="python"></CodeEditor>
              </TabsContent>
            </Tabs>
            
          </div>
        </div>
      </div>
    </main>
  );
}