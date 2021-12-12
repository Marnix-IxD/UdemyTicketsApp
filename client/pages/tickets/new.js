import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const NewTicket = () => {
    const [ title, setTitle ] = useState('');
    const [ price, setPrice ] = useState('');
    const { performRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
          title,
          price
        },
        onSuccess: (ticket) => {
            Router.push('/')
        }
    });
    
    const onSubmit = (e) => {
        e.preventDefault();
        performRequest();
    }

    const onBlurPrice = () => {
        const value = parseFloat(price);

        if (isNaN(value)) {
            return;
        }

        setPrice(value.toFixed(2));
    };

    return (
      <div>
        <h1>Create a ticket</h1>
        <form onSubmit={onSubmit}>
            <div className="form-group mb-3">
                <label htmlFor="ticketTitleInput" className="form-label">Title</label>
                <input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="form-control" 
                  id="ticketTitleInput"
                />
            </div>
            <div className="form-group mb-3">
                <label htmlFor="ticketPriceInput" className="form-label">Price</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input 
                    id="ticketPriceInput"
                    className="form-control" 
                    type='number' 
                    step='0.05' 
                    placeholder='0.00'
                    value={price} 
                    onBlur={onBlurPrice}
                    onChange={(e) => setPrice(e.target.value)}     
                  />
                </div>
            </div>
            {errors}
            <button className="btn btn-primary">Submit</button>
        </form>
      </div>
    );
};

export default NewTicket;