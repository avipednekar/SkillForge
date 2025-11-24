import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        technologies: '',
        imageUrl: '',
        projectUrl: '',
        githubUrl: ''
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/projects', {
                headers: { 'x-auth-token': token }
            });
            setProjects(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/upload/image', uploadFormData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData({ ...formData, imageUrl: `http://localhost:5000${res.data.imageUrl}` });
            setUploading(false);
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
            setUploading(false);
            setImagePreview(null);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData({ ...formData, imageUrl: '' });
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/projects', formData, {
                headers: { 'x-auth-token': token }
            });
            setFormData({
                title: '',
                description: '',
                technologies: '',
                imageUrl: '',
                projectUrl: '',
                githubUrl: ''
            });
            setImagePreview(null);
            setIsAdding(false);
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteProject = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/projects/${id}`, {
                    headers: { 'x-auth-token': token }
                });
                fetchProjects();
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <div className="text-white">Loading projects...</div>;

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">My Projects</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-primary text-sm"
                >
                    {isAdding ? 'Cancel' : 'Add Project'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={onSubmit} className="bg-surface p-6 rounded-xl border border-secondary/20 mb-8 space-y-4">
                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Project Image</label>
                        {!imagePreview ? (
                            <div className="border-2 border-dashed border-secondary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                <input
                                    type="file"
                                    id="imageUpload"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <label htmlFor="imageUpload" className="cursor-pointer">
                                    <Upload className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                                    <p className="text-slate-400 mb-1">Click to upload or drag and drop</p>
                                    <p className="text-sm text-slate-500">PNG, JPG, GIF, WebP up to 5MB</p>
                                </label>
                                {uploading && (
                                    <p className="text-primary mt-3">Uploading...</p>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Project Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={onChange}
                            required
                            className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={onChange}
                            required
                            rows="3"
                            className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Technologies (comma separated)</label>
                        <input
                            type="text"
                            name="technologies"
                            value={formData.technologies}
                            onChange={onChange}
                            className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Project URL</label>
                            <input
                                type="text"
                                name="projectUrl"
                                value={formData.projectUrl}
                                onChange={onChange}
                                placeholder="https://example.com"
                                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">GitHub URL</label>
                            <input
                                type="text"
                                name="githubUrl"
                                value={formData.githubUrl}
                                onChange={onChange}
                                placeholder="https://github.com/username/repo"
                                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Save Project'}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project._id} className="bg-surface rounded-xl border border-secondary/20 overflow-hidden flex flex-col hover:border-primary/30 transition-colors">
                        {project.imageUrl ? (
                            <img src={project.imageUrl} alt={project.title} className="w-full h-48 object-cover" />
                        ) : (
                            <div className="w-full h-48 bg-secondary/10 flex items-center justify-center">
                                <ImageIcon className="w-16 h-16 text-slate-600" />
                            </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                            <p className="text-slate-400 text-sm mb-4 flex-1">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.technologies.map((tech, index) => (
                                    <span key={index} className="text-xs bg-secondary/20 text-slate-300 px-2 py-1 rounded">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-auto">
                                <div className="flex gap-3">
                                    {project.githubUrl && (
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm">
                                            GitHub
                                        </a>
                                    )}
                                    {project.projectUrl && (
                                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover text-sm">
                                            Live Demo
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteProject(project._id)}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {projects.length === 0 && !isAdding && (
                    <div className="col-span-full text-center py-10 text-slate-500">
                        No projects added yet. Click "Add Project" to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;
