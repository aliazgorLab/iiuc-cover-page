import React, { useState } from 'react';
import { toast } from 'react-toastify';
import FormInput from '../../components/FormInput';

export const RegisterForm = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');

  const allowedDomains = ['@ugrad.iiuc.ac.bd', '@student.iiuc.ac.bd', '@iiuc.ac.bd'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !studentId || !password) {
      toast.error('Please fill in all required registration fields.');
      return;
    }

    const hasValidDomain = allowedDomains.some((domain) =>
      email.toLowerCase().endsWith(domain)
    );

    if (!hasValidDomain) {
      toast.error(
        'Registration restricted to IIUC Academic Emails (@ugrad.iiuc.ac.bd, @student.iiuc.ac.bd, @iiuc.ac.bd).'
      );
      return;
    }

    toast.info('Verification link sent to your IIUC academic email!');
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Student Full Name"
      />
      <FormInput
        label="IIUC Academic Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="c201085@ugrad.iiuc.ac.bd"
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="C201085"
        />
        <FormInput
          label="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="CSE"
        />
      </div>
      <FormInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />
      <button
        type="submit"
        className="w-full py-3 bg-[#006A4E] text-white font-bold rounded-xl hover:bg-[#00805d] transition-colors cursor-pointer"
      >
        Register Account
      </button>
    </form>
  );
};

export default RegisterForm;
