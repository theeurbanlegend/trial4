import React from 'react'

const Cross = ({err}) => {
  return (
  <>
   <div className="circle">
  <div className="before"></div>
  <div className="after"></div>
  <p style={{marginTop:'60px'}}>{err}</p>
</div>

  </>
   
  )
}

export default Cross