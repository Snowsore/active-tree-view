// JS for ActiveListShowApp

window.Alsa = function() {
	
	function wait(n) {
		return new Promise(r => setTimeout(() => r(), n));
	}
		
	async function show() {
		await wait(200);
		this.classList.remove('hidden');
	}
	
	async function hide() {
		this.classList.add('hidden');
		await wait(200);
	}
	
	async function fold() {
		this.classList.add('fold');
	}
	
	async function open() {
		this.classList.remove('fold');
	}
	
	async function toggle() {
		this.classList.toggle('fold');
	}
	
	async function select() {
		if(!this.parentElement.querySelectorAll(':scope > .selected').length) {
			getSelected().forEach(x => x.classList.remove('selected'));
		}
		this.classList.toggle('selected');
	}
	
	function isSelected() {
		return this.classList.contains('selected');
	}
	
	function getSelected() {
		return [...document.querySelectorAll('.selected')];
	}
	
	return {
		async setup() {
			var alsaBox = document.createElement('div');
			var dataBox = document.createElement('div');
			var treeBox = document.createElement('div');
			var listBox = document.createElement('div');
			var toolBox = document.createElement('div');
			var updateButton = document.createElement('input');
			var postButton = document.createElement('input');
			var postButton = document.createElement('input');
			
			alsaBox.classList.add('alsaBox');
			alsaBox.classList.add('hidden');
			dataBox.classList.add('alsaDataBox');
			treeBox.classList.add('alsaTreeBox');
			listBox.classList.add('alsaListBox');
			toolBox.classList.add('alsaToolBox');
			updateButton.classList.add('alsaButton');
			postButton.classList.add('alsaButton');
			
			updateButton.value = 'UPDATE';
			postButton.value = 'POST';
			updateButton.type = 'button';
			postButton.type = 'button';
			
			var rootTree = await createNode();
			var rootList = await createNode();
			
			rootTree.alsa.show();
			rootList.alsa.show();
			
			treeBox.append(rootTree);
			listBox.append(rootList);
			
			function createNode(node) {
				
				if(!node) node = {
					type: 0,
					N: '',
					C: [],
					hidden: true,
				}
				
				var html = document.createElement('div');
				var d = document.createElement('div');
				var i = document.createElement('i');
				var s = document.createElement('span');
				var a = document.createElement('a');
				var ul = document.createElement('ul');
					
				i.setAttribute('ico', node.type);
				s.innerHTML = node.N;
				
				if(node.hidden) d.style.display = 'none';
				
				html.classList.add('alsaNode');
				d.classList.add('alsaNodeData');
				
				html.classList.add('hidden');
				
				d.append(i);
				d.append(s);
				html.append(ul);
				html.append(d);
				html.append(a);
				
				html.alsa = {
					getChild() {
						return [...ul.children].reverse();
					},
					async addChild(node) {
						await wait(50);
						
						if(node.length == undefined) {
							var child = await createNode(node);
							ul.append(child);
							child.alsa.show();
						} else {
							for(let child of node) await this.addChild(child);
						}
					},
					async show(event) {
						for(let child of this.getChild()) await child.alsa.show();
						show.call(html);
						await wait(50);
					},
					async hide(event) {
						for(let child of this.getChild()) await child.alsa.hide();
						hide.call(html);
						await wait(50);
					},
					async fold(event) {
						for(let child of this.getChild()) await child.alsa.hide();
						fold.call(html);
					},
					async open(event) {
						for(let child of this.getChild()) await child.alsa.show();
						open.call(html);
					},
					async toggle(event) {
						if(html.classList.contains('fold')) {
							this.open();
						} else {
							this.fold();
						}
					},
					async moveTo(target) {
						if(target.closest('.alsaTreeBox')) {
							if(!html.contains(target)) {
								await this.hide();
								target.querySelector('ul').prepend(html);
								await this.show();
							}
						} else {
							for(let child of this.getChild()) await child.alsa.moveTo(target);
							await this.hide();
							rootList.querySelector('ul').prepend(html);
							await this.show();
						}
					},
					click(event) {
						select.call(html);
					},
					drag(event) {
						if(!isSelected.call(html)) {
							select.call(document.body);
							select.call(html);
						}
					},
					async dragend(event) {
						event.stopPropagation();
						var touch = event.changedTouches[0];
						var target = document.elementFromPoint(touch.clientX, touch.clientY).closest('.alsaNode');
						for(let node of getSelected()) {
							await wait(50);
							node.alsa.moveTo(target);
						}
					},
					async drop(event) {
						event.stopPropagation();
						for(let node of getSelected()) {
							await wait(50);
							node.alsa.moveTo(html);
						}
					},
					async empty() {
						for(let child of this.getChild()) await child.alsa.kill();
					},
					async kill() {
						await this.empty();
						await wait(50);
						this.hide();
						setTimeout(() => {
							html.remove();
						}, 150);
					},
					getData() {
						return {
							N: node.N,
							type: node.type,
							C: this.getChild().map(x => x.alsa.getData()),
						};
					}
				}
				
				if(node.type) d.draggable = true;
				d.ondragover = (event) => event.preventDefault(event);
				d.onclick = (event) => html.alsa.click(event);
				d.ondragstart = (event) => html.alsa.drag(event);
				d.ondrop = (event) => html.alsa.drop(event);
				a.onclick = (event) => html.alsa.toggle(event);
				d.ontouchstart = (event) => html.alsa.drag(event);
				d.ontouchend = (event) => html.alsa.dragend(event);
				
				if(node.C) html.alsa.addChild(node.C);
				
				return html;
			}
			
			alsaBox.alsa = {
				async update() {
					var { tree, list } = (await Promise.all([
						rootTree.alsa.empty(),
						rootList.alsa.empty(),
						(async () => {
							var res = await fetch('http://ext.gaomuxuexi.com:5870/task/nodes');
							if(!res.ok) alert('Error fetch');
							console.log('Get done');
							return res.json();
						})()
					]))[2];
					
					await Promise.all([
						rootTree.alsa.addChild(tree),
						rootList.alsa.addChild(list)
					])
					console.log('Show done');
				},
				async post() {
					var res = await fetch('http://ext.gaomuxuexi.com:5870/task/nodesCommit', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
						},
						body: JSON.stringify({
							tree: rootTree.alsa.getData().C[0],
							list: [...rootList.alsa.getData().C].map(x => ({N: x.N, type: x.type}))
						})
					})
					if(!res.ok) alert('Error Post');
					else {
						alert('Post successful!');
						this.update();
					}
				}
			}
			
			listBox.ondragover = (event) => event.preventDefault();
			listBox.ondrop = rootList.alsa.drop;
			
			updateButton.onclick = async (event) => await alsaBox.alsa.update();
			postButton.onclick = async (event) => await alsaBox.alsa.post();
			
			toolBox.append(updateButton);
			toolBox.append(postButton);
			
			dataBox.append(treeBox);
			dataBox.append(listBox);
			alsaBox.append(dataBox);
			alsaBox.append(toolBox);
			
			document.body.append(alsaBox);
			
			alsaBox.show = show;
			alsaBox.hide = hide;
			
			this.alsaBox = alsaBox;
			
			await alsaBox.show();
		},
		update() { this.alsaBox.alsa.update() }
	}
}