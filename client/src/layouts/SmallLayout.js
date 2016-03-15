import React from 'React'

export default function SmallLayout (Component) {
  return class Wrapper extends React.Component {
    render() {
      const props = this.props;
      return (
        <div className='container'>
          <div className="row">
            <div className="col-sm-push-3 col-sm-6 col-md-push-4 col-md-4">
              <Component {...props} ></Component>
            </div>
          </div>
        </div>
      )
    }
  }
}