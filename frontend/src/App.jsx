import axios from "axios";
import React, {useEffect, useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import bgImage from "./assets/pexels-imin-technology-276315592-12935049.jpg";
import {Link, useNavigate} from 'react-router-dom';

function Dashboard() {
  const [activePage, setActivePage] = useState("home");
  const [username, setUsername] = useState("");
  useEffect(() => {
    fetch('http://localhost:3000/api/profile',{
      credentials:'include'
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then(data => {
        setUsername(data.username);
      })
      .catch(err => {
        console.error(err);
        window.location.href = "/";//redirect to login
      });
  }, []);

  return (
    <div className="dashboard d-flex">
      <nav className="sidebar bg-primary text-white p-4">
        <h2 className="text-center">Smart Stock</h2>
        <ul className="list-unstyled">
          <li className="my-3">
            <button className="btn btn-info w-100" onClick={() => setActivePage("profile")}>User Profile</button>
          </li>
          <li className="my-3">
            <button className="btn btn-info w-100" onClick={() => setActivePage("additem")}>Add Grocery Item</button>
          </li>
          <li className="my-3">
            <button className="btn btn-info w-100" onClick={() => setActivePage("removeitem")}>Remove Item</button>
          </li>
          <li className="my-3">
            <button className="btn btn-info w-100" onClick={() => setActivePage("showlist")}>Item List</button>
          </li>
        </ul>
      </nav>

      <div className="content flex-fill p-4 bg-white rounded m-3 shadow">
        {activePage === "home" && (
          <>
            <h2 className="text-primary">Welcome {username ? username : "Guest"} to Smart Stock Dashboard</h2>
            <h6 >Smart_Stock — grocery management is the new innovative business companion 
              for small and medium scaled grocery and businesses. Store your grocery items here and 
              we assure you no item goes unnoticed before getting expired!</h6>
            <div
              className="info-section mt-4"
              style={{
                backgroundImage: `url(${bgImage})`
              }}
            >
            </div>
          </>
        )}

        {activePage === "profile" && <Profile />}
        {activePage === "additem" && <AddItem />}
        {activePage === "removeitem" && <RemoveItem />}
        {activePage === "showlist" && <ShowList />}
      </div>
    </div>
  );
}

function Profile() {
  // const [data, setData] = useState({
  //   username: '',
  //   email: ''
  // })
  // const navigate=useNavigate()
  // function fetchPro(e){

  // }
  return (
    <div>
      <h3 className="text-primary">User Profile</h3>
      <p>This is where user profile info would be shown.</p>
    </div>
  );
}

function AddItem() {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    name: '',
    mfg_date: '',
    exp_date: ''
  })
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState('');
  const [extracted, setExtracted] = useState(null);
  //const navigate = useNavigate();

  function handleManualSubmit(e){
      e.preventDefault()

      axios.post('http://localhost:3000/add_item_manual_way', {
        ...values,
        name: values.name,
        mfg_date: values.mfg_date,
        exp_date: values.exp_date
      })
      .then((res)=>{
          setSuccessType('manual');
          setShowSuccess(true);
          console.log(res);
      })
      .catch((err)=>console.log(err))
  }
  function handleImageSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    const frontImage = e.target.front.files[0];
    const labelImage = e.target.label.files[0];
    if(!frontImage || !labelImage){
      alert("Please upload both the images :) ");
      return;
    }
    formData.append('front',frontImage);
    formData.append('label',labelImage);
    
    setLoading(true);

    axios.post('http://localhost:3000/add_item_image_way', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then((res) => {
        const { product_name, mfg_date, exp_date } = res.data;
        setExtracted({ name: product_name, mfg_date, exp_date });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }
  function handleConfirm() {
    axios.post('http://localhost:3000/add_item_manual_way', {
      ...extracted
    })
      .then((res) => {
        setSuccessType('image');
        setShowSuccess(true);
        console.log(res);
      })
      .catch((err) => console.log(err));
  }

  function handleTryAgain() {
    setExtracted(null);
    document.getElementById('front').value = '';
    document.getElementById('label').value = '';
  }
  return (
    <div className="container my-4">
      <h2 className="text-primary text-center">Add Grocery Item</h2>
      {showSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Success!</strong> {successType === 'manual' ? 'Item added manually' : 'Item added via image'}
          <div className="mt-2">
            <button 
              onClick={() => window.location.href = '/react-dashboard'} 
              className="btn btn-sm btn-outline-primary me-2"
            >
              Dashboard
            </button>
            <button 
              onClick={() => {
                setShowSuccess(false);
                if (successType === 'manual') {
                  setValues({
                    name: '',
                    mfg_date: '',
                    exp_date: ''
                  });
                }
                if(successType == 'image'){
                  handleTryAgain();
                }
              }}
              className="btn btn-sm btn-outline-success"
            >
              {successType === 'manual' ? 'Add Another Item' : 'Upload Another Image'}
            </button>
          </div>
        </div>
      )}
      <div className="row g-4">
      <div className="col-lg-6">
      <div className="card border-primary p-4 shadow-sm">
        <h5>Manual Entry</h5>
        <form onSubmit={handleManualSubmit}>
          <div className="mb-3">
            <label htmlFor="productName" className="form-label">Product Name</label>
            <input type="text" className="form-control" id="productName" name="productName" required value={values.name} onChange={(e) => setValues({...values, name: e.target.value})}/>
          </div>
          <div className="mb-3">
            <label htmlFor="mfgDate" className="form-label">Manufactured Date</label>
            <input type="date" className="form-control" id="mfgDate" name="mfgDate" required value={values.mfg_date} onChange={(e) => setValues({...values,mfg_date: e.target.value })}/>
          </div>
          <div className="mb-3">
            <label htmlFor="expDate" className="form-label">Expiry Date</label>
            <input type="date" className="form-control" id="expDate" name="expDate" required value={values.exp_date} onChange={(e) => setValues({...values,exp_date: e.target.value })}/>
          </div>
          <button type="submit" className="btn btn-primary">Add Manually</button>
        </form>
      </div>
      </div>
      <div className="col-lg-6">
      <div className="card border-primary p-4 shadow-sm">
        <h5>Upload via Image</h5>
        <form onSubmit={handleImageSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="front" className="form-label">Front Image</label>
            <input type="file" className="form-control" id="front" name="front" accept="image/*" required />
          </div>
          <div className="mb-3">
            <label htmlFor="label" className="form-label">Label Image</label>
            <input type="file" className="form-control" id="label" name="label" accept="image/*" required />
          </div>
          <button type="submit" className="btn btn-primary"> Extract details! </button>
        </form>
        {loading && (
              <div className="text-center mt-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-2">Extracting details from images...</div>
              </div>
        )}
        {extracted && (
              <div className="mt-4">
                <h6 className="fw-bold">Extracted Details:</h6>
                <div className="mb-2">
                  <label>Product Name</label>
                  <input type="text" className="form-control" value={extracted.name} readOnly />
                </div>
                <div className="mb-2">
                  <label>Manufactured Date</label>
                  <input type="date" className="form-control" value={extracted.mfg_date} readOnly />
                </div>
                <div className="mb-2">
                  <label>Expiry Date</label>
                  <input type="date" className="form-control" value={extracted.exp_date} readOnly />
                </div>

                <div className="mt-3 d-flex flex-wrap gap-2">
                  <button onClick={handleConfirm} className="btn btn-success">Confirm</button>
                  <button onClick={() => window.location.href = '/react-dashboard'} className="btn btn-secondary me-2">Cancel</button>
                  <button onClick={handleTryAgain} className="btn btn-warning">Try Again</button>
                </div>
              </div>
            )}
      </div>
      </div>
    </div>
    </div>
  );
}

function RemoveItem() {
  const [id, setItemId] = useState('');
  const [message, setMessage] = useState('');

  const handleRemove = (e) => {
    e.preventDefault();

    fetch(`http://localhost:3000/remove_item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage(`✅ Product with ID ${id} removed successfully.`);
        } else {
          setMessage(`❌ No product found with ID ${id}.`);
        }
        setItemId(''); // clear the field
      })
      .catch((err) => {
        console.error(err);
        setMessage('❌ Error removing item.');
      });
  };

  return (
    <div className="container mt-4">
      <h3 className="text-primary">Remove Item</h3>

      <form onSubmit={handleRemove}>
        <div className="mb-3">
          <label htmlFor="id" className="form-label">Enter Product ID to Remove</label>
          <input
            type="text"
            className="form-control"
            id="id"
            value={id}
            onChange={(e) => setItemId(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-danger">Remove</button>
      </form>

      {message && (
        <div className="alert mt-3" style={{ whiteSpace: 'pre-wrap' }}>
          {message}
        </div>
      )}

      <a href="/react-dashboard" className="btn btn-secondary mt-3">Back to Dashboard</a>
    </div>
  );
}

function ShowList() {
  const [data,setData]=useState([]);
  
  useEffect(() => {
    axios
      .get('http://localhost:3000/get_items')
      .then((res) => {
        console.log("data ",res.data);
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, []);
  return (
    <div className="container mt-4">
      <h3 className="text-primary">Item List</h3>
      <p>The list of available items is:</p>
      <button className="btn btn-success mb-3" onClick={() => window.location.href = "/react-dashboard"}>Back to Dashboard</button>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Manufacture Date</th>
            <th>Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.mfg_date}</td>
              <td>{item.exp_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
