import { useState, useEffect } from 'react';

const DB_NAME = 'BatisseursEngagesDB';
const DB_VERSION = 1;

export interface Document {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  dueDate?: Date;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
}

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: string;
  function?: string;
  status: 'active' | 'inactive' | 'pending';
  memberRole: 'admin' | 'secretary' | 'member';
  createdAt: Date;
}

export interface Note {
  id: number;
  documentId: number;
  userId: number;
  content: string;
  createdAt: Date;
}

let db: IDBDatabase | null = null;

async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains('documents')) {
        database.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('categories')) {
        database.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('members')) {
        database.createObjectStore('members', { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains('notes')) {
        database.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function addDocument(doc: Omit<Document, 'id'>): Promise<Document> {
  const database = await initDB();
  const store = database.transaction('documents', 'readwrite').objectStore('documents');
  
  const newDoc: Document = {
    ...doc,
    id: Date.now(),
  };
  
  return new Promise((resolve, reject) => {
    const request = store.add(newDoc);
    request.onsuccess = () => resolve(newDoc);
    request.onerror = () => reject(request.error);
  });
}

export async function getDocuments(): Promise<Document[]> {
  const database = await initDB();
  const store = database.transaction('documents', 'readonly').objectStore('documents');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateDocument(id: number, updates: Partial<Document>): Promise<void> {
  const database = await initDB();
  const store = database.transaction('documents', 'readwrite').objectStore('documents');
  
  const getRequest = store.get(id);
  
  return new Promise((resolve, reject) => {
    getRequest.onsuccess = () => {
      const doc = getRequest.result;
      if (doc) {
        const updated = { ...doc, ...updates, updatedAt: new Date() };
        const updateRequest = store.put(updated);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Document not found'));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteDocument(id: number): Promise<void> {
  const database = await initDB();
  const store = database.transaction('documents', 'readwrite').objectStore('documents');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function addCategory(cat: Omit<Category, 'id'>): Promise<Category> {
  const database = await initDB();
  const store = database.transaction('categories', 'readwrite').objectStore('categories');
  
  const newCat: Category = {
    ...cat,
    id: Date.now(),
  };
  
  return new Promise((resolve, reject) => {
    const request = store.add(newCat);
    request.onsuccess = () => resolve(newCat);
    request.onerror = () => reject(request.error);
  });
}

export async function getCategories(): Promise<Category[]> {
  const database = await initDB();
  const store = database.transaction('categories', 'readonly').objectStore('categories');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addMember(member: Omit<Member, 'id'>): Promise<Member> {
  const database = await initDB();
  const store = database.transaction('members', 'readwrite').objectStore('members');
  
  const newMember: Member = {
    ...member,
    id: Date.now(),
  };
  
  return new Promise((resolve, reject) => {
    const request = store.add(newMember);
    request.onsuccess = () => resolve(newMember);
    request.onerror = () => reject(request.error);
  });
}

export async function getMembers(): Promise<Member[]> {
  const database = await initDB();
  const store = database.transaction('members', 'readonly').objectStore('members');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateMember(id: number, updates: Partial<Member>): Promise<void> {
  const database = await initDB();
  const store = database.transaction('members', 'readwrite').objectStore('members');
  
  const getRequest = store.get(id);
  
  return new Promise((resolve, reject) => {
    getRequest.onsuccess = () => {
      const member = getRequest.result;
      if (member) {
        const updated = { ...member, ...updates };
        const updateRequest = store.put(updated);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Member not found'));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteMember(id: number): Promise<void> {
  const database = await initDB();
  const store = database.transaction('members', 'readwrite').objectStore('members');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function addNote(note: Omit<Note, 'id'>): Promise<Note> {
  const database = await initDB();
  const store = database.transaction('notes', 'readwrite').objectStore('notes');
  
  const newNote: Note = {
    ...note,
    id: Date.now(),
  };
  
  return new Promise((resolve, reject) => {
    const request = store.add(newNote);
    request.onsuccess = () => resolve(newNote);
    request.onerror = () => reject(request.error);
  });
}

export async function getNotesByDocument(documentId: number): Promise<Note[]> {
  const database = await initDB();
  const store = database.transaction('notes', 'readonly').objectStore('notes');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const allNotes = request.result;
      resolve(allNotes.filter(n => n.documentId === documentId));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteNote(id: number): Promise<void> {
  const database = await initDB();
  const store = database.transaction('notes', 'readwrite').objectStore('notes');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
