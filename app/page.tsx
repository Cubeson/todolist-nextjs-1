'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Calendar, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, isWithinInterval, addDays, isBefore } from 'date-fns';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate: Date | null;
}

export default function Home() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [newTodo, setNewTodo] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: newTodo.trim(), 
        completed: false,
        dueDate: selectedDate
      }]);
      setNewTodo('');
      setSelectedDate(new Date());
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditDate(todo.dueDate || new Date());
  };

  const saveEdit = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editText, dueDate: editDate } : todo
    ));
    setEditingId(null);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const getUrgencyColor = (dueDate: Date | null) => {
    if (!dueDate) return '';
    const now = new Date();
    
    if (isBefore(dueDate, now)) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
    
    if (isWithinInterval(dueDate, { start: now, end: addDays(now, 1) })) {
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    }
    
    if (isWithinInterval(dueDate, { start: now, end: addDays(now, 3) })) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    }
    
    return 'bg-white dark:bg-gray-700';
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border-0 shadow-xl">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Todo List
            </h1>
            
            <div className="flex gap-2 mb-8">
              <Input
                placeholder="Add a new todo..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTodo)}
                className="bg-white dark:bg-gray-700"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[40px] p-0">
                    <Calendar className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={addTodo}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-4 rounded-lg shadow-sm group border ${
                    getUrgencyColor(new Date(todo.dueDate || ''))
                  }`}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <div className="flex-1 space-y-1">
                    {editingId === todo.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, () => saveEdit(todo.id))}
                          className="bg-white dark:bg-gray-700"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[40px] p-0">
                              <Calendar className="h-5 w-5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={editDate}
                              onSelect={(date) => setEditDate(date || new Date())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Button onClick={() => saveEdit(todo.id)} size="icon">
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`block ${
                            todo.completed
                              ? 'text-gray-400 dark:text-gray-500 line-through'
                              : 'text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {todo.text}
                        </span>
                        {todo.dueDate && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {format(new Date(todo.dueDate), 'PPP')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {editingId !== todo.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => startEditing(todo)}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {todos.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No todos yet. Add one above!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}