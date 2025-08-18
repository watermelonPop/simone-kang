import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressBook } from '@fortawesome/free-solid-svg-icons';
import './ContactWidget.css';

function ContactWidget() {

    return (
        <div className='outerContactWidget'>
                <p className='contactTitle'><FontAwesomeIcon icon={faAddressBook}></FontAwesomeIcon> Contact Me:</p>
                <div className='contactRow'>
                        <p className='contactLabel'>Phone: </p>
                        <p>(818)-294-5480</p>
                </div>
                <div className='contactRow'>
                        <p className='contactLabel'>Email: </p>
                        <p>Simonek@andrew.cmu.edu</p>
                </div>
        </div>
    );
}

export default ContactWidget;
