import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Image URL</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={onChange}
                                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Project URL</label>
                            <input
                                type="text"
                                name="projectUrl"
                                value={formData.projectUrl}
                                onChange={onChange}
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
                                className="w-full bg-background border border-secondary/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary">Save Project</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project._id} className="bg-surface rounded-xl border border-secondary/20 overflow-hidden flex flex-col">
                        {project.imageUrl && (
                            <img src={project.imageUrl} alt={project.title} className="w-full h-48 object-cover" />
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
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                                            GitHub
                                        </a>
                                    )}
                                    {project.projectUrl && (
                                        <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
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
