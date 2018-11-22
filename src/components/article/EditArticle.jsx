// react libraries
import React, { Fragment, Component } from 'react';
import  { Redirect }  from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchSingleArticle } from '../../action/article/viewArticle/fetchSingleArticle';

// third-party libraries
import propTypes from 'prop-types';
import ContentEditable from 'react-contenteditable';
import Editor from 'react-medium-editor';
import Loader from 'react-loader';
import swal from 'sweetalert';
import queryString from 'query-string'

// modules
import Header from '../reusables/header/Header';
import SearchTag from '../../containers/tag/SearchTag';
import Button from '../reusables/button/Button';
import editorOptions from './editorConfig';

/**
 * @class CreateArticle
 * @extends {Component}
 * @param {object} event
 */
class EditArticle extends Component {
  state = {
    article: {
      title: '',
      body: '',
      imageUrl: null,
      description: ''
    },
    sidebarActive: false,
    displayImage: null,
    articleError: {
      title: '',
      description: '',
      body: ''
    },
    tags:[],
    editMode:false,
  };

  componentDidMount(){
    const value = queryString.parse(this.props.location.search);
    console.log('*******', value)
    if(value){
      this.setState({
        editMode:true
      })
      this.props.fetchSingleArticle(value.slug)
    }else{
      return null
    }
  }

  handleEnterKey = (event) => {
    const tags  = this.state.tags;
    const tagName = event.target.value;
    const convertedTagName = tagName.trim().toLowerCase();
      if (tags.length <= 4) {
        if (event.keyCode === 13) {
          if(convertedTagName.length > 2){
          if (tags.includes(convertedTagName) === false) {
            const currentTags = [...tags, convertedTagName];
            this.setState({
              tags: currentTags
            });
          }
          event.target.value = '';
        }else{
          swal('Failed', 'tag character must not be lesser than 3', 'error')
        }
      }
    }
  }

  handleAddToTags = (event) => {
    const tags  = this.state.tags;
    const tagName = event.target.textContent;
    const convertedTagName = tagName.trim().toLowerCase();
    if (tags.includes(convertedTagName) === false) {
      const currentTags = [...tags, convertedTagName];
      this.setState({
        tags: currentTags
      });
    }
  }

  handleRemoveTag = (event) => {
    const tags  = this.state.tags;
    const tagIndex = event.target.dataset.key;
    const currentTag = tags.filter(tag => tag !== tags[tagIndex]);
    this.setState({
      tags: currentTag
    });
  }

  handleTitleOnChange = (event) => {
    const { article } = this.state;
    const data = { ...article, title: event.target.value };
    this.setState({
      article: data
    });
  }

  fileSelectedHandler = (event) => {
    const { article } = this.state;
    const displayImage = URL.createObjectURL(event.target.files[0]);
    const data = { ...article, imageUrl: event.target.files[0] };
    this.setState({
      article: data,
      displayImage
    });
  }

  handleChange = (event) => {
    const { article } = this.state;
    const data = { ...article, description: event.target.value };
    this.setState({
      article: data
    });
  }

  handleEditorChange = (body) => {
    const { article } = this.state;
    const data = { ...article, body };
    this.setState({
      article: data
    });
  }

  handleActiveSidebar = (event) => {
    event.preventDefault();
    this.setState({
      sidebarActive: !this.state.sidebarActive
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const {
      imageUrl,
      title,
      body,
      description,
    } = this.state.article;
    const tagArray = this.state.tags;
    const formData = new FormData();
    formData.append('image', imageUrl);
    formData.append('description', description);
    formData.append('title', title);
    formData.append('body', body);
    const tags = tagArray.join(',');
    this.props.createNewArticle(formData, tags)
    .then(response => {
      let errorMessages = '';
      Object.keys(this.props.publishedArticle.error)
      .forEach(key => errorMessages = errorMessages + this.props.publishedArticle.error[key][0] + '\n');
      response
        ? swal('Success', 'Article published Successfully', 'success')
        : swal('Failed', errorMessages, 'error')}
      );
  };

  render() {
    if(this.state.editMode === true){
      if(this.props.publishedArticle.processing){
        console.log(this.props.publishedArticle.Articles)
      }
      console.log('----',this.props.fetchedSingleArticle.processing)
    }
   
    const user = JSON.parse(localStorage.getItem('user'));
    const authUser = this.props.loginUser.user;
    return (
      <Fragment>
        <Header
          isAuth={authUser }
          user={user || authUser }
        />
      <div className="l-ah-create-article">
        <Button type="publish-ready-btn" text="Ready to publish?" onClick={this.handleActiveSidebar} />
        <section className="create-article-wrap">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <form action="" className="create-article-form">
                  <ContentEditable
                    html={this.state.article.title || ''}
                    name="title"
                    className="article-title"
                    onChange={this.handleTitleOnChange}
                  />
                  <div className="form-body-wrap">
                    <div className="input-wrap">
                      <label htmlFor="image">Add a featured image <i className="fas fa-images"></i></label>
                      <input type="file" id="image" name="image" className="form-body" aria-describedby="helpId" onChange={this.fileSelectedHandler}/>
                    </div>
                    <div>
                      <img className="img-fluid" src={this.state.displayImage} />
                    </div>
                  </div>
                  <div className="article-editor-wrap">
                    <Editor
                      text={this.state.article.body}
                      value={this.state.article.body}
                      onChange={this.handleEditorChange}
                      options={editorOptions}
                      className="article-editor"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <div
          className={ `l-ah-article-sidebar ${this.state.sidebarActive && ' active'}` }
        >
          <div className="sidebar-inner">
            <i
              className="fas sidebar-close fa-times-circle"
              aria-hidden="true"
              onClick={this.handleActiveSidebar}
            ></i>
            <div className="sidebar-desc">
              <p>Description</p>
              <textarea
                type="text"
                onChange= { this.handleChange }
                name="description"
                placeholder="Type here..."
                value={this.state.article.description}
              />
            </div>
            <p>Tags will help readers to know what your story is about. Add or Change Tags(max 5)</p>
            <SearchTag
              tags={this.state.tags}
              handleEnterKey={this.handleEnterKey}
              handleAddToTags={this.handleAddToTags}
              handleRemoveTag={this.handleRemoveTag}
            />
            <div className="cta-btn">
              <Button type="publish-btn" text="Publish" onClick={this.handleSubmit}/>
              <Button type="discard-btn" text="Discard" />
              {/* <div style={loading}>
                  <Loader color="#0FC86F" speed={1}className="spinner"/>
              </div> */}
              {/* <button className="discard-btn btn">Discard</button> */}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
    );
  }
}

const mapStateToProps = (state = {}) => ({
  fetchedSingleArticle: state.fetchSingleArticleReducer.article,
  loginUser: state.auth
});

const mapDispatchToProps = dispatch => ({
  fetchSingleArticle: slug => dispatch(fetchSingleArticle(slug)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditArticle);