const B2BPostMission: React.FC = () => {
  const [missionData, setMissionData] = useState({
    title: '',
    description: '',
    budget: 0,
    requiredSkills: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    experienceLevel: 'débutant',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMissionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await b2bService.postMission(missionData);
      alert("Mission publiée avec succès !");
      setMissionData({ title: '', description: '', budget: 0, requiredSkills: '', startDate: '', endDate: '', startTime: '', endTime: '', experienceLevel: 'débutant' });
    } catch (error) {
      console.error("Failed to post mission:", error);
      alert("Erreur lors de la publication de la mission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Publier une Nouvelle Mission</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre de la Mission</label>
            <input type="text" id="title" name="title" value={missionData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={missionData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required></textarea>
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget (€)</label>
            <input type="number" id="budget" name="budget" value={missionData.budget} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
          </div>
          <div>
            <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700">Compétences Requises</label>
            <input type="text" id="requiredSkills" name="requiredSkills" value={missionData.requiredSkills} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Date de début</label>
              <input type="date" id="startDate" name="startDate" value={missionData.startDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Date de fin</label>
              <input type="date" id="endDate" name="endDate" value={missionData.endDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Heure de début</label>
              <input type="time" id="startTime" name="startTime" value={missionData.startTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Heure de fin</label>
              <input type="time" id="endTime" name="endTime" value={missionData.endTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
            </div>
          </div>
          <div>
            <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">Niveau d'expérience requis</label>
            <select id="experienceLevel" name="experienceLevel" value={missionData.experienceLevel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="débutant">Débutant</option>
              <option value="intermédiaire">Intermédiaire</option>
              <option value="expérimenté">Expérimenté</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center space-x-2 disabled:opacity-50">
              {loading ? 'Publication...' : 'Publier la Mission'}
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default B2BPostMission;