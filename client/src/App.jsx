import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PostList from './PostList'
import PostPage from './PostPage'
import AddPost from './AddPost'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PostList />} />
        <Route path='/posts/:id' element={<PostPage />} />
        <Route path='/add' element={<AddPost />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App