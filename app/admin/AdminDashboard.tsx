"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface Book {
  id: number
  title: string
}

interface Category {
  id: number
  name: string
}

interface Publisher {
  id: number
  name: string
}

interface Author {
  id: number
  name: string
}

interface AdminDashboardProps {
  initialBooks: Book[]
  initialCategories: Category[]
  initialPublishers: Publisher[]
  initialAuthors: Author[]
}

export default function AdminDashboard({
  initialBooks,
  initialCategories,
  initialPublishers,
  initialAuthors,
}: AdminDashboardProps) {
  const supabase = createClient()

  const [tab, setTab] = useState("books")
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [publishers, setPublishers] = useState<Publisher[]>(initialPublishers)
  const [authors, setAuthors] = useState<Author[]>(initialAuthors)

  const [newCategory, setNewCategory] = useState("")
  const [newPublisher, setNewPublisher] = useState("")
  const [newAuthor, setNewAuthor] = useState("")

  const addCategory = async () => {
    const { data, error } = await supabase.from("categories").insert({ name: newCategory }).select()
    if (!error && data) {
      setCategories([...categories, ...data])
      setNewCategory("")
    }
  }

  const deleteCategory = async (id: number) => {
    await supabase.from("categories").delete().eq("id", id)
    setCategories(categories.filter((c) => c.id !== id))
  }

  const addPublisher = async () => {
    const { data, error } = await supabase.from("publishers").insert({ name: newPublisher }).select()
    if (!error && data) {
      setPublishers([...publishers, ...data])
      setNewPublisher("")
    }
  }

  const deletePublisher = async (id: number) => {
    await supabase.from("publishers").delete().eq("id", id)
    setPublishers(publishers.filter((p) => p.id !== id))
  }

  const addAuthor = async () => {
    const { data, error } = await supabase.from("authors").insert({ name: newAuthor }).select()
    if (!error && data) {
      setAuthors([...authors, ...data])
      setNewAuthor("")
    }
  }

  const deleteAuthor = async (id: number) => {
    await supabase.from("authors").delete().eq("id", id)
    setAuthors(authors.filter((a) => a.id !== id))
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full max-w-4xl mx-auto py-10">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="books">Books ({initialBooks.length})</TabsTrigger>
        <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
        <TabsTrigger value="publishers">Publishers ({publishers.length})</TabsTrigger>
        <TabsTrigger value="authors">Authors ({authors.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="books">
        <h2 className="text-xl font-semibold mb-4">Total Books: {initialBooks.length}</h2>
        <ul className="list-disc pl-5 space-y-1">
          {initialBooks.map((book) => (
            <li key={book.id}>{book.title}</li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="categories">
        <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
        <ul className="list-disc pl-5 space-y-1">
          {categories.map((c) => (
            <li key={c.id} className="flex justify-between items-center">
              <span>{c.name}</span>
              <Button variant="outline" size="sm" onClick={() => deleteCategory(c.id)}>Delete</Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Button onClick={addCategory}>Add</Button>
        </div>
      </TabsContent>

      <TabsContent value="publishers">
        <h2 className="text-xl font-semibold mb-4">Manage Publishers</h2>
        <ul className="list-disc pl-5 space-y-1">
          {publishers.map((p) => (
            <li key={p.id} className="flex justify-between items-center">
              <span>{p.name}</span>
              <Button variant="outline" size="sm" onClick={() => deletePublisher(p.id)}>Delete</Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="New Publisher"
            value={newPublisher}
            onChange={(e) => setNewPublisher(e.target.value)}
          />
          <Button onClick={addPublisher}>Add</Button>
        </div>
      </TabsContent>

      <TabsContent value="authors">
        <h2 className="text-xl font-semibold mb-4">Manage Authors</h2>
        <ul className="list-disc pl-5 space-y-1">
          {authors.map((a) => (
            <li key={a.id} className="flex justify-between items-center">
              <span>{a.name}</span>
              <Button variant="outline" size="sm" onClick={() => deleteAuthor(a.id)}>Delete</Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="New Author"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
          />
          <Button onClick={addAuthor}>Add</Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}