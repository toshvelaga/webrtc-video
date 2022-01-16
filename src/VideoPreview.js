import React from 'react'

const VideoPreview = () => {
  return (
    <div>
      <h1>Video Preview</h1>
      {/* <div>
        <div
          style={{
            background: 'white',
            width: '30%',
            height: 'auto',
            padding: '20px',
            minWidth: '400px',
            textAlign: 'center',
            margin: 'auto',
            marginTop: '50px',
            justifyContent: 'center',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold', paddingRight: '50px' }}>
            Set your username
          </p>
          <Input
            placeholder='Username'
            value={username}
            onChange={(e) => handleUsername(e)}
          />
          <Button
            variant='contained'
            color='primary'
            onClick={connect}
            style={{ margin: '20px' }}
          >
            Connect
          </Button>
        </div>

        <div
          style={{
            justifyContent: 'center',
            textAlign: 'center',
            paddingTop: '40px',
          }}
        >
          <video
            id='my-video'
            ref={localVideoref}
            autoPlay
            muted
            style={{
              borderStyle: 'solid',
              borderColor: '#bdbdbd',
              objectFit: 'fill',
              width: '60%',
              height: '30%',
            }}
          ></video>
        </div>
      </div> */}
    </div>
  )
}

export default VideoPreview
