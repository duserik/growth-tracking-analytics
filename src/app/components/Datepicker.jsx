import React from 'react';

import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';

class Datepicker extends React.Component {
  render() {
    const { label, date, setDate } = this.props;
    return (
      <div style={{ margin: 10 }}>
        <div
          style={{
            fontSize: '1.5rem',
            color: '#777777'
          }}
        >
          {label}
        </div>
        <Flatpickr
          value={date}
          onChange={setDate}
          options={{
            altInput: true,
            altFormat: 'F j, Y',
            dateFormat: 'Y-m-d'
          }}
        />
      </div>
    );
  }
}

export default Datepicker;
