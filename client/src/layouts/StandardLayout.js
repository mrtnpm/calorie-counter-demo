import React from 'React'

export default function StandardLayout (Component) {
  return class Wrapper extends React.Component {
    render() {
      const props = this.props;
      return (
        <div className='container'>
          <div className="row">
            <div className="col-sm-12">
              <Component {...props} ></Component>
            </div>
          </div>
        </div>
      )
    }
  }
}