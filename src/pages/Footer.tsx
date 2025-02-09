import { useNavigate } from 'react-router-dom';
const Footer = () => {
  const navigate = useNavigate();
  const handleCGUClick = () => {
    navigate('/Cgu');};
  return (
    <footer className="bg-gray-100 border-t">
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} Y. Tous droits réservés. </div>
          <div className="space-x-6">
            <button
              onClick={handleCGUClick}
              className="text-sm text-gray-600 hover:text-blue-500 transition-colors" >
              Conditions Générales d'Utilisation
            </button> </div> </div> </div> </footer>);};
export default Footer;