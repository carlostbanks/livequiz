import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function TopicsManagement() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'Beginner'
  });

  useEffect(() => {
    fetchTopics();
    
    // Check if we should auto-open the create modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('create') === 'true') {
      setShowCreateModal(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/admin/topics');
    }
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          questions:questions(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include question count
      const topicsWithCounts = data.map(topic => ({
        ...topic,
        questionCount: topic.questions[0]?.count || 0
      }));

      setTopics(topicsWithCounts);
    } catch (error) {
      console.error('Error fetching topics:', error);
      alert('Error loading topics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTopic) {
        // Update existing topic
        const { error } = await supabase
          .from('topics')
          .update(formData)
          .eq('id', editingTopic.id);

        if (error) throw error;
        alert('Topic updated successfully!');
      } else {
        // Create new topic
        const { error } = await supabase
          .from('topics')
          .insert([formData]);

        if (error) throw error;
        alert('Topic created successfully!');
      }

      // Reset form and close modal
      setFormData({ name: '', description: '', difficulty: 'Beginner' });
      setShowCreateModal(false);
      setEditingTopic(null);
      fetchTopics(); // Refresh the list
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('Error saving topic');
    }
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      description: topic.description || '',
      difficulty: topic.difficulty || 'Beginner'
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (topic) => {
    if (!confirm(`Are you sure you want to delete "${topic.name}"? This will also delete all questions in this topic.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topic.id);

      if (error) throw error;
      
      alert('Topic deleted successfully!');
      fetchTopics(); // Refresh the list
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Error deleting topic');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', difficulty: 'Beginner' });
    setEditingTopic(null);
    setShowCreateModal(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container">
        
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="display-6 fw-bold text-primary mb-2">
                  📚 Topics Management
                </h1>
                <p className="text-muted">Create and manage quiz topics</p>
              </div>
              <div>
                <button 
                  className="btn btn-success me-2"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create Topic
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/admin')}
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Topics List */}
        {topics.length === 0 ? (
          <div className="text-center py-5">
            <h3 className="text-muted mb-3">No topics created yet</h3>
            <p className="text-muted mb-4">Create your first topic to get started!</p>
            <button 
              className="btn btn-success btn-lg"
              onClick={() => setShowCreateModal(true)}
            >
              + Create First Topic
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {topics.map((topic) => (
              <div key={topic.id} className="col-lg-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    
                    {/* Topic Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title fw-bold text-dark mb-1">
                        {topic.name}
                      </h5>
                      <span className={`badge bg-${getDifficultyColor(topic.difficulty)}`}>
                        {topic.difficulty}
                      </span>
                    </div>

                    {/* Topic Description */}
                    <p className="card-text text-muted small mb-3">
                      {topic.description || 'No description provided'}
                    </p>

                    {/* Topic Stats */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Questions:</span>
                        <span className="fw-semibold">{topic.questionCount}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Created:</span>
                        <span className="small">{new Date(topic.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/admin/topics/${topic.id}/questions`)}
                      >
                        Manage Questions ({topic.questionCount})
                      </button>
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleEdit(topic)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(topic)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create/Edit Topic Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingTopic ? 'Edit Topic' : 'Create New Topic'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={resetForm}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  
                  {/* Topic Name */}
                  <div className="mb-3">
                    <label htmlFor="topicName" className="form-label">Topic Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="topicName"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="e.g., JavaScript Basics"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label htmlFor="topicDescription" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="topicDescription"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of this topic..."
                    ></textarea>
                  </div>

                  {/* Difficulty */}
                  <div className="mb-3">
                    <label htmlFor="topicDifficulty" className="form-label">Difficulty Level</label>
                    <select
                      className="form-select"
                      id="topicDifficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    {editingTopic ? 'Update Topic' : 'Create Topic'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicsManagement;