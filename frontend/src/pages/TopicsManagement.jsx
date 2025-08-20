import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNotification, useConfirmation } from '../components/NotificationSystem';

function TopicsManagement() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false); // Remove loading screen entirely
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'Beginner'
  });

  const { showSuccess, showError, NotificationContainer } = useNotification();
  const { confirm, ConfirmationModal } = useConfirmation();

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
      showError('Failed to load topics. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (editingTopic) {
        // Update existing topic
        const { error } = await supabase
          .from('topics')
          .update(formData)
          .eq('id', editingTopic.id);

        if (error) throw error;
        showSuccess('Topic updated successfully!');
      } else {
        // Create new topic
        const { error } = await supabase
          .from('topics')
          .insert([formData]);

        if (error) throw error;
        showSuccess('Topic created successfully!');
      }

      // Reset form and close modal
      setFormData({ name: '', description: '', difficulty: 'Beginner' });
      setShowCreateModal(false);
      setEditingTopic(null);
      fetchTopics(); // Refresh the list
    } catch (error) {
      console.error('Error saving topic:', error);
      showError('Failed to save topic. Please try again.');
    } finally {
      setSaving(false);
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
    const confirmed = await confirm({
      title: 'Delete Topic',
      message: `Are you sure you want to delete "${topic.name}"? This will also delete all ${topic.questionCount} questions in this topic.`,
      confirmText: 'Delete',
      confirmVariant: 'danger'
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topic.id);

      if (error) throw error;
      
      showSuccess(`Topic "${topic.name}" deleted successfully!`);
      fetchTopics(); // Refresh the list
    } catch (error) {
      console.error('Error deleting topic:', error);
      showError('Failed to delete topic. Please try again.');
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
        <div className={`fade-in ${topics.length > 0 ? 'show' : ''}`}>
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
              {topics.map((topic, index) => (
                <div 
                  key={topic.id} 
                  className="col-lg-6 col-xl-4"
                  style={{
                    animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="card border-0 shadow-sm h-100 hover-card">
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

      </div>

      {/* Create/Edit Topic Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
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
                    <label htmlFor="topicName" className="form-label fw-semibold">Topic Name *</label>
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
                    <label htmlFor="topicDescription" className="form-label fw-semibold">Description</label>
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
                    <label htmlFor="topicDifficulty" className="form-label fw-semibold">Difficulty Level</label>
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
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {editingTopic ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingTopic ? 'Update Topic' : 'Create Topic'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <NotificationContainer />
      <ConfirmationModal />

      {/* Custom Styles */}
      <style>{`
        .hover-card {
          transition: all 0.2s ease-in-out;
        }
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        .fade-in {
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        .fade-in.show {
          opacity: 1;
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default TopicsManagement;