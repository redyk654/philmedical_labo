import React from 'react';
import { Link } from 'react-router-dom';

interface Bilan {
  numero: string;
  dateEnregistrement: string;
  status: 'Complété' | 'Incomplet';
}

const bilans: Bilan[] = [
  { numero: "64", dateEnregistrement: "6 April 2019", status: "Complété" },
  { numero: "80", dateEnregistrement: "3 March 2006", status: "Incomplet" },
  { numero: "19", dateEnregistrement: "2 July 2017", status: "Complété" },
  { numero: "24", dateEnregistrement: "22 February 2019", status: "Complété" },
  { numero: "66", dateEnregistrement: "28 August 2022", status: "Incomplet" },
  { numero: "83", dateEnregistrement: "8 January 2020", status: "Complété" },
  { numero: "28", dateEnregistrement: "20 February 2022", status: "Complété" }
];

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">PROFIL PATIENT</h1>
        <div className="space-x-4">
          <Link
            to="/nouveau-bilan"
            className="inline-flex items-center px-4 py-2 bg-[#464E77] text-white rounded-md hover:bg-[#363c5d] transition-colors"
          >
            Nouveau Bilan
          </Link>
          <Link
            to="/dernier-bilan"
            className="inline-flex items-center px-4 py-2 border border-[#464E77] text-[#464E77] rounded-md hover:bg-gray-50 transition-colors"
          >
            Afficher Le Dernier Bilan
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Informations Personnelles</h2>
          <Link
            to="/edit-profile"
            className="text-[#464E77] hover:text-[#363c5d] transition-colors"
          >
            Editer Le Profil
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Nom</label>
              <div className="mt-1 text-gray-900">Ali Mambwe</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Sexe</label>
              <div className="mt-1 text-gray-900">Homme</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Age</label>
              <div className="mt-1 text-gray-900">5 Ans</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Date Naissance</label>
              <div className="mt-1 text-gray-900">12 July 2019</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Adresse</label>
              <div className="mt-1 text-gray-900">Douala</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Code Patient</label>
              <div className="mt-1 text-gray-900">AKDJ2O</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Telephone</label>
              <div className="mt-1 text-gray-900">(560) 710-8565</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Profession</label>
              <div className="mt-1 text-gray-900">Policier</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Situation Matrimoniale</label>
              <div className="mt-1 text-gray-900">Celibataire</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-capitalize">Hitorique Des Bilans</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  code Labo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date D'enregistrement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bilans.map((bilan, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bilan.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bilan.dateEnregistrement}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      bilan.status === 'Complété'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bilan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/bilan/${bilan.numero}`}
                      className="text-[#464E77] hover:text-[#363c5d] transition-colors"
                    >
                      Afficher Les Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;