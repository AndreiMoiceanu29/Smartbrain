import React, { Component } from 'react';
import './App.css';
import SignIn from './components/SignIn/SignIn'
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Clarifai from 'clarifai';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
const app=new Clarifai.App({
  apiKey:'e034b8f8c9e7460e8f800f9667858e44'
});

const particlesOptions={
  
                particles: {
                  number:{
                   value:100,
                   density:{
                    enable:true,
                    value_area:800
                   }
                    }
                  }
                  
                
              
}

const initalState={
     input:'',
      imageUrl:'',
      box:{},
      route:'signin',
      isSignedIn:false,
      user:{
        email:'',
        id:'',
        name:'',
        entries:0,
        joined:''
      }

}

class App extends Component {
  constructor(){
    super();
    this.state={
      input:'',
      imageUrl:'',
      box:{},
      route:'signin',
      isSignedIn:false,
      user:{
        email:'',
        id:'',
        name:'',
        entries:0,
        joined:''
      }
    }
  }
 
  loadUser=(data)=>{
    this.setState({user:{
       email:data.email,
       id:data.id,
       name:data.name,
       entries:data.entries,
       joined:data.joined
    }})

  }
 
  calculateFaceLocation=(data)=>{
     const clarifaiFace= data.outputs[0].data.regions[0].region_info.bounding_box;
     const image=document.getElementById('inputimage');
     const width=Number(image.width);
     const height=Number(image.height);
     console.log(width);
     return{
      leftCol:clarifaiFace.left_col*width,
      topRow:clarifaiFace.top_row*height,
      rightCol:width-(clarifaiFace.right_col*width),
      bottomRow:height-(clarifaiFace.bottom_row*height)
     }
  }

  displayFaceBox=(box)=>{
    console.log(box);
    this.setState({box});
  }

  onInputChange=(event)=>{
    this.setState({input:event.target.value})
  }
  onButtonSubmit=()=>{
    this.setState({imageUrl:this.state.input})
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    .then(response=>{
      if(response){
        fetch('http://localhost:3000/image',{
      method:'put',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        id:this.state.user.id
      })
      })
        .then(response=>response.json())
        .then(count=>{
          this.setState(Object.assign(this.state.user,{entries:count}))
        })
        .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err=>console.log(err))
  
  }
  onRouteChange=(route)=>{
    if(route==='signOut'){
      this.setState(initalState)
    }
    else if(route==='home')
    {
      this.setState({isSignedIn:true})
    }
    this.setState({route})
  }
  render() {
    return (
      <div className="App">
       <Particles 
              className='particles'
              params={particlesOptions}
            />
           {this.state.route==='home'? <div>
       <Navigation onRouteChange={this.onRouteChange}/>
        <Logo/>
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
       <ImageLinkForm onButtonSubmit={this.onButtonSubmit} onInputChange={this.onInputChange}/>
       <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
       </div>:(
        this.state.route==='signin'?
         <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
          
         
    }
      </div>
    );
  }
}

export default App;
