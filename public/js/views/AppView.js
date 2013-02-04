define([
  'jquery',
  'underscore',
  'backbone',
  'views/ArticleView',
  'router',
  'models/article',
  'utils/ConfigManager',
  'views/comps/PagerButton',
  'collections/albums',
  'views/AlbumListView',
  'collections/photos',
  'views/PhotoListView',
  'views/VideoListView',
  'collections/videos',
  'collections/articles',
  'views/ArticleListView'

], function ($, _, Backbone, ArticleView, AppRouter, articleModel, ConfigManager, Pager, Albums, AlbumListView, Photos, PhotoListView, VideoListView, Videos, Articles, ArticleListView){
	
	return Backbone.View.extend({
		
		pagerBtn:null, currentView:null, albumView:null, historyTab:null,

		$container:$('div#content'),
		$headerList:$('div#title'),
		$pager:$('#pager'),
		$preloader:$('div#preloader'),

		urlAPI:'api/',
		
		initialize:function(){
			
			// console.log(ConfigManager.DEVICE);

			this.historyTab = new Backbone.Collection();
		
			_.bindAll(this, 'contentRequest', 'getArticleView', 'getListView', 'defaultPath', 'getAlbums', 'getPhotos', 'getVideos');

			this.appRouter = new AppRouter();
			this.appRouter.on('route:root', this.getListView);
			this.appRouter.on('route:getAllThema', this.getListView);
			this.appRouter.on('route:getThema', this.getListView);
			this.appRouter.on('route:getSubThema', this.getListView);
			this.appRouter.on('route:getArticle', this.getArticleView);
			this.appRouter.on('route:getJobs', this.getListView);
			this.appRouter.on('route:getJob', this.getArticleView);
			this.appRouter.on('route:getPresseFolder', this.getListView);
			this.appRouter.on('route:getPresseArticle', this.getArticleView);
			this.appRouter.on('route:getEvenements', this.getListView);
			this.appRouter.on('route:getEvenement', this.getArticleView);
			this.appRouter.on('route:default', this.defaultPath);
			this.appRouter.on('route:getAlbums', this.getAlbums);
			this.appRouter.on('route:getPhotos', this.getPhotos);
			this.appRouter.on('route:getVideos', this.getVideos);
			Backbone.history.start({pushState:false});

		},

		defaultPath:function(path){
			this.appRouter.navigate('', {trigger:true});
		},

		contentRequest:function(){
			
			var self = this;

			//if previous view IS NOT article : reset scroll pos (ex:new thema filter)
			//en gros : si on vient d'une liste pour passer à une autre liste -> y :0
			if(this.currentView && this.currentView.collection){
				$(window).scrollTop(0);
			}

			this.$preloader.show();
			this.$pager.hide();
			this.$headerList.empty();
			this.$container.empty();

			$(window).trigger('pageRequest');

			//close diaporama if open, and return to gallery
			$('div.ps-toolbar-close').trigger('click');
		},

		updateHistory:function(){

			var self = this;
			var currentURL = Backbone.history.fragment;

			if(this.historyTab.where({pUrl:currentURL}).length){
				_.find(self.historyTab.models, function (value){
					return value.get('pUrl') === currentURL;
				}).set('pageCount', self.currentView.collection.currentPage);
			}
			else {
				this.historyTab.add({
					pUrl:currentURL,
					pageCount:0
				});
			}

			console.log(self.currentView)
		},

		updateContent:function(){
			
			//hide preloader
			this.$preloader.hide();
			//udate view
			this.$container.empty().append(this.currentView.el);

			//update title & subtitle
			var headerList = ConfigManager.getListType(Backbone.history.fragment);
			this.$headerList.append('<h1>'+headerList.title+'</h1><p>'+headerList.subTitle+'</p>');

			//add or not pager btn
			if(this.currentView.collection){
				this.pagerBtn = new Pager({
					collection:this.currentView.collection
				}).render();
				this.$pager.show();
			}

		},

		getListView:function(){

			this.contentRequest();
			var self = this;

			var url = Backbone.history.fragment;
			var apiURL = url.length ? url.substring(0,url.length) : 'all';

			var articleListView = new ArticleListView({
				collection:new Articles({
					url:self.urlAPI.concat(apiURL)
				})
			});
			
			articleListView.collection.pager({
				success:function(collection, response){
					self.currentView = articleListView;
					self.updateHistory();
					self.updateContent();
				}
			});

		},

		getArticleView:function(){
			
			this.contentRequest();
			var self = this;
			var url = window.location.hash;
			
			var article = new articleModel();
			article.url = url.substring(1,url.length);
			
			var articleView = new ArticleView({
				model:article
			});
			articleView.model.fetch({
				success:function(){
					self.currentView = articleView;
					self.updateContent();
				}
			});
		},

		getAlbums:function(){
			this.contentRequest();
			var self = this;
			if(this.albumView){
				this.currentView = this.albumView;
				this.updateContent();
				//rebind events on 'afficher la suite'
				this.albumView.delegateEvents();
				return;
			}

			this.albumView = new AlbumListView({
				collection:new Albums()
			});
			this.albumView.collection.pager({
				success:function(){
					self.currentView = self.albumView;
					self.updateContent();
				}
			});
		},

		getPhotos:function(albumID){
			var self = this;

			this.contentRequest();

			var tofs = new Photos({
				url:ConfigManager.GRAPH_URL + albumID + '/photos'
			});
			tofs.albumID = albumID;
			
			//waiting for album name before launch complete view
			$.when($.getJSON(ConfigManager.GRAPH_URL + albumID, function (response){
				tofs.name = response.name;
			}))
			.then(function(){
				var photoListView = new PhotoListView({
					collection:tofs
				});
				photoListView.collection.fetch({
					data:{limit:100},
					success:function(){
						//render to launch diapo
						photoListView.render();
						self.$preloader.hide();
					}
				});
				self.$container.empty().append(photoListView.el);
			});
		},

		getVideos:function(){
			var self = this;
			this.contentRequest();

			var videoListView = new VideoListView({
				collection:new Videos()
			});
			videoListView.collection.pager({
				success:function(){
					self.currentView = videoListView;
					self.updateContent();
				}
			});
		}
		
	});

});