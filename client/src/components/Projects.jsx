import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Code, Plus, X, Trash2, ExternalLink, Github, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from './ui/FileUpload';
import { EmptyState } from './ui/EmptyState';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        technologies: '',
        imageUrl: '',
        projectUrl: '',
        githubUrl: ''
    });

    const [filter, setFilter] = useState('All');

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load projects');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Extract unique tags
    const allTags = ['All', ...new Set(projects.flatMap(p => p.technologies))];

    // Filter projects
    const filteredProjects = filter === 'All'
        ? projects
        : projects.filter(p => p.technologies.includes(filter));

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setSelectedFile(file);

        // Upload to server
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const res = await api.post('/upload/image', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData({ ...formData, imageUrl: `http://localhost:5000${res.data.imageUrl}` });
            setUploading(false);
            toast.success('Image uploaded successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload image');
            setUploading(false);
            setSelectedFile(null);
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setFormData({ ...formData, imageUrl: '' });
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/projects', formData);
            setFormData({
                title: '',
                description: '',
                technologies: '',
                imageUrl: '',
                projectUrl: '',
                githubUrl: ''
            });
            setSelectedFile(null);
            setIsAdding(false);
            fetchProjects();
            toast.success('Project added successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to add project');
        }
    };

    const deleteProject = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await api.delete(`/projects/${id}`);
                fetchProjects();
                toast.success('Project deleted');
            } catch (err) {
                console.error(err);
                toast.error('Failed to delete project');
            }
        }
    };

    if (loading) return (
        <div className="bg-surface rounded-2xl border border-white/10 p-6 shadow-xl animate-pulse">
            <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
            <div className="h-48 bg-white/5 rounded-xl"></div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" /> My Projects
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`btn ${isAdding ? 'bg-white/10 hover:bg-white/20 text-white' : 'btn-primary'} text-xs font-semibold flex items-center gap-2 px-4 py-2 rounded-lg transition-all`}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? 'Cancel' : 'Add Project'}
                </button>
            </div>

            {/* Tag Filter */}
            {!isAdding && projects.length > 0 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setFilter(tag)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap
                                ${filter === tag
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {isAdding && (
                <form onSubmit={onSubmit} className="bg-surface p-6 rounded-2xl border border-white/10 shadow-xl mb-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Project Image</label>
                        <FileUpload
                            onFileSelect={handleFileSelect}
                            selectedFile={selectedFile}
                            onClear={removeImage}
                            accept={{ 'image/*': [] }}
                            label="Drag & drop project screenshot"
                        />
                        {uploading && (
                            <p className="text-primary mt-2 text-xs font-medium animate-pulse">Uploading image...</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Project Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={onChange}
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="e.g. E-commerce Platform"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={onChange}
                                required
                                rows="3"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                                placeholder="Briefly describe your project..."
                            ></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Technologies (comma separated)</label>
                            <input
                                type="text"
                                name="technologies"
                                value={formData.technologies}
                                onChange={onChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="React, Node.js, MongoDB"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Project URL</label>
                            <div className="relative">
                                <ExternalLink className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                                <input
                                    type="text"
                                    name="projectUrl"
                                    value={formData.projectUrl}
                                    onChange={onChange}
                                    placeholder="https://example.com"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">GitHub URL</label>
                            <div className="relative">
                                <Github className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                                <input
                                    type="text"
                                    name="githubUrl"
                                    value={formData.githubUrl}
                                    onChange={onChange}
                                    placeholder="https://github.com/username/repo"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <button type="submit" className="btn btn-primary px-8 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Save Project'}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                    <div key={project._id} className="group bg-surface rounded-2xl border border-white/10 overflow-hidden flex flex-col hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 shadow-xl">
                        <div className="relative h-40 overflow-hidden">
                            {project.imageUrl ? (
                                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center group-hover:from-slate-800 group-hover:to-primary/20 transition-colors">
                                    <ImageIcon className="w-12 h-12 text-slate-600 group-hover:text-primary/50 transition-colors" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                            <p className="text-slate-400 text-xs mb-4 flex-1 line-clamp-3 leading-relaxed">{project.description}</p>

                            <div className="flex flex-wrap gap-2 mb-5">
                                {project.technologies.map((tech, index) => (
                                    <span key={index} className="text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                                <div className="flex gap-3">
                                    {project.githubUrl && (
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="View Code">
                                            <Github className="w-4 h-4" />
                                        </a>
                                    )}
                                    {project.projectUrl && (
                                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary-hover transition-colors" title="Live Demo">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteProject(project._id)}
                                    className="text-red-400/60 hover:text-red-400 text-[10px] font-medium px-2 py-1 rounded-full hover:bg-red-400/10 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && !isAdding && (
                    <div className="col-span-full">
                        <EmptyState
                            icon={Code}
                            title="No projects yet"
                            description="Showcase your work to the world. Add your first project to get started."
                            action={
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="btn btn-primary px-6 py-2"
                                >
                                    Add Your First Project
                                </button>
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;