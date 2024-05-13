import { GameOptions } from '../options/gameOptions'

export class TeamBar extends Phaser.GameObjects.Container {
  lifespan
  pool: Phaser.GameObjects.Sprite[] = []
  teamContainers: Map<number, Phaser.GameObjects.Container>

  constructor(scene, x, y) {
    super(scene, x, y, [])

    this.teamContainers = new Map()

    this.setScrollFactor(0)
    this.setDepth(999999)

    const coords = [
      [
        GameOptions.teamBarSize.width / 2 +
          GameOptions.marginMarker * 2 +
          GameOptions.teamBarSize.offsetX,
        GameOptions.teamBarSize.height / 2 + GameOptions.marginMarker * 2
      ],
      [
        GameOptions.screen.width -
          (GameOptions.teamBarSize.width / 2 + GameOptions.marginMarker * 2) -
          GameOptions.teamBarSize.offsetX,
        GameOptions.teamBarSize.height / 2 + GameOptions.marginMarker * 2
      ]
    ]
    for (let i = 0; i < this.scene.configRound.config.countTeams; i++) {
      // const bg = this.scene.add.rectangle(
      //   0,
      //   0,
      //   GameOptions.teamBarSize.width,
      //   GameOptions.teamBarSize.height,
      //   0x000000,
      //   0.5
      // )

      const container = this.scene.add.container(coords[i][0], coords[i][1], [])
      // if (i === 0) {
      //   container.scaleX = -1
      // }
      this.teamContainers.set(i, container)
      this.add(container)
    }

    // for (const cont of this.teamContainers) {
    //   this.add(cont)
    // }

    this.scene.add.existing(this)
  }

  getTeamBar(id: number) {
    return this.teamContainers.get(id)
  }

  createSprite() {
    const sprite = this.scene.add
      .sprite(0, 0, 'effects', 1)
      .setActive(false)
      .setVisible(false)
      .setDepth(1)
      .setScale(1.5)
    this.pool.push(sprite)
    return sprite
  }

  addEffect(x, y, frame = 1, scale = 1) {
    let sprite = this.pool.find((x) => !x.visible)
    if (!sprite) {
      sprite = this.createSprite()
    }

    sprite.setFrame(frame)
    sprite.setAngle(Phaser.Math.Between(-180, 180))

    sprite.setScale(scale)
    sprite.setPosition(x, y)

    // sprite.setActive(true)
    sprite.setVisible(true)
  }

  // preUpdate(time, delta) {
  //   super.preUpdate(time, delta)

  //   this.lifespan -= delta

  //   if (this.lifespan <= 0 && this.lifespan > -200 && !this.anims.isPlaying) {
  //     this.boom()
  //   }
  // }
}
