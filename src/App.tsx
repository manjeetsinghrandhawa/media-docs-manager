import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import VerifyEmail from './components/VerifyEmail';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Provider store={store}>
      <div className="app-shell flex min-h-screen w-screen flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <main className="mx-auto w-full max-w-7xl px-6 pb-12 pt-10 sm:px-10">
              <section className="surface-card fade-up grid gap-8 overflow-hidden p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="mb-4 inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                    Intelligent Workspace
                  </p>
                  <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                    Welcome to Media and Docs Manager
                  </h1>
                  <p className="mt-5 max-w-2xl text-base text-slate-200 sm:text-lg">
                    Centralize documents, audio, video, and rich media in one secure workspace. Upload, preview, categorize, and download with a workflow designed for professional teams and creators.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/signup" className="btn-primary px-6 py-3 text-sm sm:text-base">Create your account</Link>
                    <Link to="/login" className="btn-ghost px-6 py-3 text-sm sm:text-base">Sign in to dashboard</Link>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <article className="surface-soft p-5">
                    <h3 className="text-lg font-semibold text-white">Secure by Design</h3>
                    <p className="mt-2 text-sm text-slate-300">Token-based authentication with protected routes for private file management.</p>
                  </article>
                  <article className="surface-soft p-5">
                    <h3 className="text-lg font-semibold text-white">Preview and Organize</h3>
                    <p className="mt-2 text-sm text-slate-300">Built-in previews for text, PDF, audio, and video with category filters and search.</p>
                  </article>
                  <article className="surface-soft p-5">
                    <h3 className="text-lg font-semibold text-white">Fast Collaboration Flow</h3>
                    <p className="mt-2 text-sm text-slate-300">Upload in minutes, access files instantly, and maintain an efficient media library.</p>
                  </article>
                </div>
              </section>

              <section className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="surface-soft p-5">
                  <p className="text-2xl font-bold text-cyan-200">Multi Format</p>
                  <p className="mt-2 text-sm text-slate-300">Text, docs, audio, video, and PDFs under one clean dashboard.</p>
                </div>
                <div className="surface-soft p-5">
                  <p className="text-2xl font-bold text-emerald-200">Upload + Preview</p>
                  <p className="mt-2 text-sm text-slate-300">No extra tooling needed to inspect your content quickly.</p>
                </div>
                <div className="surface-soft p-5">
                  <p className="text-2xl font-bold text-sky-200">Search and Filter</p>
                  <p className="mt-2 text-sm text-slate-300">Find the right file fast with smart category and keyword controls.</p>
                </div>
              </section>
            </main>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard/*" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </Provider>
  );
}

export default App;
